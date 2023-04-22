<template>
  <v-app>
    <v-card flat>
      <v-toolbar dense>
        <v-btn icon @click="go_back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-list-item style="width: 200px">
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              背诵
            </v-list-item-title>
            <v-list-item-subtitle>
              背诵模式: {{ mode }} 剩余 {{ recite_queue.length }} 个知识点
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-toolbar>
    </v-card>
    <v-alert
        style="margin-top: 10px"
        border="right"
        colored-border
        :type="alert_message.type"
        elevation="2"
        v-model="alert_message.show"
        dismissible
    >
      {{ alert_message.message }}
    </v-alert>
    <v-card style="margin-top: 10px" v-if="reciting">
      <v-card-title>剩余 {{ recite_queue.length }} 题</v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <h1>{{ library[recite_queue[0]].title }}</h1>
        <div style="margin-top: 20px"></div>
        <v-textarea
            v-for="(item, i) in library[recite_queue[0]].points"
            v-model="current.inputs[i]"
            :key="i"
            :name="'answer-input-' + i"
            :label="'分点-' + i"
            auto-grow
            filled
            rows="1"
            :hint="current.hints[i]"
            @input="line_checker(i)"
        ></v-textarea>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" @click="submit_answer()">提交</v-btn>
      </v-card-actions>
    </v-card>
    <v-card style="margin-top: 10px" v-else>
      <v-card-title>剩余 {{ recite_queue.length }} 题</v-card-title>
      <v-card-subtitle>背诵完成后请点击确定</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <h1>{{ library[recite_queue[0]].title }}</h1>
        <div style="margin-top: 20px"></div>
        <ul>
          <li v-for="point in library[recite_queue[0]].points" :key="point">
            {{ point }}
          </li>
        </ul>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" @click="reciting = true; alert_message.show = false">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script>
import frontend from "@/assets/frontend"

const electron = window.require('electron')

export default {
  name: "RecitingStart",
  data: () => ({
    reciting: false,
    archive: {},
    library: [],
    recite_queue: [],
    goal: 0,
    mode: '',
    current: {
      index: 0,
      inputs: [],
      hints: []
    },
    alert_message: {
      show: false,
      message: "",
      type: "error"
    },
  }),
  methods: {
    go_back() {
      this.$router.go(-1)
    },
    submit_answer() {
      console.log(this.current.inputs)
      let passed = frontend.methods.run_judge(this.current.inputs, this.library[this.recite_queue[0]].points)
      if (passed) {
        if (this.recite_queue.length === 1) {
          /* 完成 更新存档 */
          if (this.mode === 'goal_new') {
            this.archive.today.recited += this.goal
            this.archive.all_recited += this.goal
          } else if (this.mode === 'goal_review' || this.mode === 'random_recite') {
            this.archive.today.reviewed += this.goal
          }
          electron.ipcRenderer.on('command.sync_data.callback', (event, args) => {
            electron.ipcRenderer.removeAllListeners('command.sync_data.callback')
            if (args.status) {
              this.$router.push(`/reciting/finished?mode=${this.mode}&count=${this.goal}`)
            } else {
              this.alert_message = {
                show: true,
                message: "更新数据失败，请检查后端是否出现错误!",
                type: "error"
              }
            }
          })
          electron.ipcRenderer.send('command.sync_data', this.archive)
        } else {
            this.recite_queue.shift()
            this.current.inputs = []
            for (let i in this.library[this.recite_queue[0]].points) {
                this.current.inputs.push('')
            }
            this.reciting = false
        }
      } else {
        this.alert_message = {
          show: true,
          message: "总正确率低于 0.8 ，请认真背诵后进行默写。",
          type: "error"
        }
        if (this.recite_queue[0] !== this.recite_queue[this.recite_queue.length - 1]) {
            this.recite_queue.push(this.recite_queue[0])
        }
        this.reciting = false
      }
    },
    line_checker(i) {
      this.current.hints[i] = frontend.methods.get_correct_rate(this.current.inputs[i], this.library[this.recite_queue[0]].points[i])
    }
  },
  created() {
    electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
      electron.ipcRenderer.removeAllListeners('command.read_data.callback')
      if (args.status) {
        console.log('ipc callback.')
        this.archive = args.data

        electron.ipcRenderer.on('command.get_library.callback', (event, args) => {
          electron.ipcRenderer.removeAllListeners('command.get_library.callback')
          if (args.status) {
            this.library = args.data
            this.mode = this.$route.query.mode
            if (this.mode === 'goal_new') {
              this.goal = this.archive.goal_per_day < this.archive.knowledge_count - this.archive.all_recited ? this.archive.goal_per_day : this.archive.knowledge_count - this.archive.all_recited
            } else if (this.mode === 'goal_review') {
              this.goal = this.archive.review_per_day
            }
            this.current.inputs = []
            this.current.hints = []
            for (let i = 0; i < this.goal; i++) {
              this.recite_queue.push(frontend.methods.point_getter(this.mode, i, this.archive.all_recited, this.archive.knowledge_count));
            }
            for (let _ in this.library[this.recite_queue[0]].points) {
              this.current.inputs.push('')
              this.current.hints.push('0.0000')
            }
          } else {
            console.log('load failed')
            this.alert_message = {
              show: true,
              message: "载入提纲文件失败, 请检查是否正确设置了提纲文件路径!",
              type: "error"
            }
          }
        })
        electron.ipcRenderer.send('command.get_library', this.archive.use_book)

      } else {
        this.alert_message = {
          show: true,
          message: '加载存档失败! 请检查程序是否完整且拥有读写文件的权限!',
          type: 'error'
        }
      }
    })
    electron.ipcRenderer.send('command.read_data')
  }
}
</script>

<style scoped>

</style>