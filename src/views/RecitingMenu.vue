<template>
  <v-app>
    <v-card
        elevation="2">
      <v-img
          height="250"
          src="https://api.ixiaowai.cn/api/api.php"
      ></v-img>
      <v-alert
          style="margin: 10px;"
          border="right"
          colored-border
          :type="alert_message.type"
          elevation="2"
          v-model="alert_message.show"
          dismissible
      >
        {{ alert_message.message }}
      </v-alert>
      <v-card-title>背诵 & 复习</v-card-title>
      <v-card-subtitle>开始背诵知识点吧~</v-card-subtitle>
      <v-divider></v-divider>

      <v-card-title>背诵情况</v-card-title>
      <v-card-text>
        <p>
          <v-icon>mdi-book</v-icon>
          已背诵 {{ archive.all_recited }} / {{ archive.knowledge_count }} 个知识点
          累计背诵 {{ archive.held_days }} 天 剩余 {{ (archive.knowledge_count - archive.all_recited) / archive.goal_per_day }} 天
          <v-progress-linear style="margin-top: 5px;"
                             :value="(archive.all_recited / archive.knowledge_count) * 100"></v-progress-linear>
        </p>
        今天已背诵 <span class="big_number">{{ archive.today.recited }}</span> 个知识点 已复习 <span class="big_number">{{
          archive.today.reviewed
        }}</span> 个知识点<br>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-title>背诵知识点</v-card-title>
      <v-card-text>
        <v-btn elevation="2" color="primary" @click="route_go('/reciting/start?mode=goal_new')">
          开始背诵新知识点吧~ ({{ archive.today.recited }} / {{ archive.goal_per_day }})
        </v-btn>
        <v-btn style="margin-left: 5px;" elevation="2" color="primary" @click="route_go('/reciting/start?mode=goal_review')">
          复习知识点 ({{ archive.today.reviewed }} / {{ archive.review_per_day }})
        </v-btn>
      </v-card-text>
    </v-card>
  </v-app>
</template>

<script>
const electron = window.require('electron');

export default {
  name: "reciting-menu",
  data: () => ({
    library: [],
    alert_message: {
      show: false,
      message: "",
      type: "error"
    },
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
      use_book: ""
    },
  }),
  methods: {
    route_go(path) {
       this.$router.push(path);
    }
  },
  created() {
    electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
      electron.ipcRenderer.removeAllListeners('command.read_data.callback');
      if (args.status) {
        console.log('ipc callback.')
        this.archive = args.data;
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
.big_number {
  font-size: 50px;
  font-weight: bold;
  font-style: italic;
  font-family: Consolas;
}
</style>