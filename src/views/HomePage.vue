<template>
  <v-app>
    <v-dialog v-model="show_ok_dialog" persistent max-width="340">
      <v-card>
        <v-card-title class="text-h5">
          {{ ok_dialog.title }}
        </v-card-title>
        <v-card-text>
          {{ ok_dialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-btn
              color="green darken-1"
              text
              @click="show_ok_dialog = false"
          >
            {{ ok_dialog.ok_button_text }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card
        elevation="2">
      <v-img
          height="250"
          src="@/assets/background_hw_2.jpg"
      ></v-img>
      <v-card-title>早安，内卷人！</v-card-title>
      <v-card-subtitle>向着自己所追求的目标前进吧~</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-title>一言 (Hitokoto)</v-card-title>
      <v-card-text>
        {{ hitokoto['hitokoto'] }}<br>
        -- {{ hitokoto['from'] }}<br>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-title>背诵情况</v-card-title>
      <v-card-text>
        <p>
          <v-icon>mdi-book</v-icon>
          已背诵 {{ archive.all_recited }} / {{ archive.knowledge_count }} 个知识点
          累计背诵 {{ archive.held_days }} 天
          剩余 {{ (archive.knowledge_count - archive.all_recited) / archive.goal_per_day }} 天<br>
          <v-progress-linear style="margin-top: 5px"
                             :value="(archive.all_recited / archive.knowledge_count) * 100"></v-progress-linear>
        </p>
        今天已背诵 <span class="big_number">{{ archive.today.recited }}</span> 个知识点 已复习 <span class="big_number">{{
          archive.today.reviewed
        }}</span> 个知识点<br>
      </v-card-text>
    </v-card>
  </v-app>
</template>

<script>
import axios from "axios"

const electron = window.require('electron')

export default {
  name: "home-page",
  data: () => ({
    hitokoto: {},
    archive: {
      goal_per_day: 0,
      review_per_day: 0,
      today: {
        task_is_finished: false,
        recited: 0,
        reviewed: 0, day: "0000-00-00"
      },
      held_days: 0,
      all_recited: 0,
      knowledge_count: 0,
    },
    ok_dialog: {
      title: '',
      message: '',
      ok_button_text: ''
    },
    show_ok_dialog: false,
  }),
  methods: {
    get_hitokoto() {
      axios.get('https://v1.hitokoto.cn/?c=a').then((data) => {
        if (data.status === 200) {
          this.hitokoto = data.data
        }
      })
    },
    get_archive() {
      electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
        electron.ipcRenderer.removeAllListeners('command.read_data.callback')
        if (args.status) {
          console.log('ipc callback.')
          this.archive = args.data
        } else {
          this.ok_dialog = {
            title: '错误',
            message: '加载存档失败! 请检查程序是否完整且拥有读写文件的权限!',
            ok_button_text: '确定'
          }
          this.show_ok_dialog = true
        }
      })
      electron.ipcRenderer.send('command.read_data')
    }
  },
  created() {
    this.get_hitokoto()
    this.get_archive()
  }
}
</script>

<style scoped>
.big_number {
  font-size: 50px;
  font-weight: bold;
  font-style: italic;
  font-family: Consolas;
}
</style>