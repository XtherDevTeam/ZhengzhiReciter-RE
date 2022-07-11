<template>
  <v-app>
    <v-card flat>
      <v-toolbar dense>
        <v-btn icon @click="go_back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-list-item style="width: 200px;">
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              背诵
            </v-list-item-title>
            <v-list-item-subtitle>
              背诵模式: {{ mode }} 需背诵 {{ recited + 1 }} / {{ goal }} 个知识点
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-toolbar>
    </v-card>
    <v-alert
        style="margin-top: 10px;"
        border="right"
        colored-border
        :type="alert_message.type"
        elevation="2"
        v-model="alert_message.show"
        dismissible
    >
      {{ alert_message.message }}
    </v-alert>
    <v-card style="margin-top: 10px;" v-if="reciting">
      <v-card-title>第{{ recited + 1 }} / {{ goal }} 题</v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <h1>{{ library[current.index].title }}</h1>
        <div style="margin-top: 20px"></div>
        <v-textarea
            v-for="(item, i) in library[current.index].points"
            v-model="current.inputs[i]"
            :key="i"
            :name="'answer-input-' + i"
            :label="'分点-' + i"
            rows="1"
        ></v-textarea>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" @click="submit_answer()">提交</v-btn>
      </v-card-actions>
    </v-card>
    <v-card style="margin-top: 10px;" v-else>
      <v-card-title>第{{ recited + 1 }} / {{ goal }} 题</v-card-title>
      <v-card-subtitle>背诵完成后请点击确定</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <h1>{{ library[current.index].title }}</h1>
        <div style="margin-top: 20px;"></div>
        <ul>
          <li v-for="point in library[current.index].points" :key="point">
            {{ point }}
          </li>
        </ul>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" @click="reciting = true;">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script>
import frontend from "@/assets/frontend";

const electron = window.require('electron');

export default {
  name: "RecitingStart",
  data: () => ({
    reciting: false,
    archive: {},
    library: [],
    recited: 0,
    goal: 0,
    mode: '',
    current: {
      index: 0,
      inputs: []
    },
    alert_message: {
      show: false,
      message: "",
      type: "error"
    },
  }),
  methods: {
    go_back() {
      this.$router.go(-1);
    },
    submit_answer() {
      console.log(this.current.inputs);
      let passed = frontend.methods.run_judge(this.current.inputs, this.library[this.current.index].points);
      if (passed) {
        this.recited++;
        if (this.recited >= this.goal) {
          /* 完成 更新存档 */
          if (this.mode === 'goal_new') {
            this.archive.today.recited += this.recited;
            this.archive.all_recited += this.recited;
          } else if (this.mode === 'goal_review' || this.mode == 'random_recite') {
            this.archive.today.reviewed += this.recited;
          }
          electron.ipcRenderer.on('command.sync_data.callback', (event, args) => {
            electron.ipcRenderer.removeAllListeners('command.sync_data.callback');
            if (args.status) {
              this.$router.push(`/reciting/finished?mode=${this.mode}&count=${this.recited}`);
            } else {
              this.alert_message = {
                show: true,
                message: "更新数据失败，请检查后端是否出现错误!",
                type: "error"
              };
            }
          });
          electron.ipcRenderer.send('command.sync_data', this.archive);
        }
        this.current.index = frontend.methods.point_getter(this.mode, this.recited, this.archive.all_recited, this.archive.knowledge_count);
        this.current.inputs = [];
        for (let i in this.library[this.current.index].points) {
          this.current.inputs.push('');
        }
        this.reciting = false;
      } else {
        this.alert_message = {
          show: true,
          message: "答案被驳回，看来还不是很熟啊...",
          type: "error"
        };
        this.reciting = false;
      }
    }
  },
  created() {
    electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
      electron.ipcRenderer.removeAllListeners('command.read_data.callback');
      if (args.status) {
        console.log('ipc callback.')
        this.archive = args.data;

        electron.ipcRenderer.on('command.get_library.callback', (event, args) => {
          electron.ipcRenderer.removeAllListeners('command.get_library.callback');
          if (args.status) {
            this.library = args.data;
            this.mode = this.$route.query.mode;
            if (this.mode === 'goal_new') {
              this.goal = this.archive.goal_per_day;
            } else if (this.mode === 'goal_review') {
              this.goal = this.archive.review_per_day;
            }
            this.current.index = frontend.methods.point_getter(this.mode, this.recited, this.archive.all_recited, this.archive.knowledge_count);
            this.current.inputs = [];
            for (let i in this.library[this.current.index].points) {
              this.current.inputs.push('');
            }
          } else {
            console.log('load failed')
            this.alert_message = {
              show: true,
              message: "载入提纲文件失败, 请检查是否正确设置了提纲文件路径!",
              type: "error"
            };
          }
        })
        electron.ipcRenderer.send('command.get_library', this.archive.use_book);

      } else {
        this.alert_message = {
          show: true,
          message: '加载存档失败! 请检查程序是否完整且拥有读写文件的权限!',
          type: 'error'
        };
      }
    });
    electron.ipcRenderer.send('command.read_data');
  }
}
</script>

<style scoped>

</style>