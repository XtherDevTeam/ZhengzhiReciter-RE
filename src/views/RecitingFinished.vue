<template>
  <v-app>
    <v-card
        elevation="2">
      <v-img
          height="250"
          src="@/assets/background_hw_2.jpg"
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
      <v-card-title>
        <v-icon style="color: green">mdi-checkbox-marked-circle</v-icon>
        背诵完成!
      </v-card-title>
      <v-card-subtitle>加油~ (ง •_•)ง</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-title>背诵情况</v-card-title>
      <v-card-text>
        <p>
          <v-icon>mdi-book</v-icon>
          已背诵 {{ archive.all_recited }} / {{ archive.knowledge_count }} 个知识点
          累计背诵 {{ archive.held_days }} 天 剩余
          {{ (archive.knowledge_count - archive.all_recited) / archive.goal_per_day }} 天
          <v-progress-linear style="margin-top: 5px;"
                             :value="(archive.all_recited / archive.knowledge_count) * 100"></v-progress-linear>
        </p>
        背诵模式: {{ this.this_time.mode }} 本次背诵 <span class="big_number">{{ this.this_time.count }}</span> 个知识点<br>
        <div style="margin-top: 10px;"></div>
        今天已背诵 <span class="big_number">{{ archive.today.recited }}</span> 个知识点
        已复习 <span class="big_number">{{ archive.today.reviewed }}</span> 个知识点<br>
      </v-card-text>
    </v-card>
  </v-app>
</template>

<script>
const electron = window.require('electron');

export default {
  name: "book-preview",
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
    this_time: {
      'mode': '',
      'count': ''
    }
  }),
  created() {
    electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
      electron.ipcRenderer.removeAllListeners('command.read_data.callback');
      if (args.status) {
        console.log('ipc callback.')
        this.archive = args.data;
        this.this_time.mode = this.$route.query.mode;
        this.this_time.count = this.$route.query.count;

        electron.ipcRenderer.on('command.get_library.callback', (event, args) => {
          electron.ipcRenderer.removeAllListeners('command.get_library.callback');
          if (args.status) {
            this.library = args.data;
            if (this.archive.today.recited >= this.archive.goal_per_day && this.archive.today.reviewed >= this.archive.review_per_day) {
              if (!this.archive.today.task_is_finished) {
                this.archive.today.task_is_finished = true;
                this.archive.held_days++;
                electron.ipcRenderer.on('command.sync_data.callback', (event, args) => {
                  electron.ipcRenderer.removeAllListeners('command.sync_data.callback');
                  if (args.status) {
                    this.alert_message = {
                      show: true,
                      message: '已同步背诵数据到档案，今日背诵目标已完成！',
                      type: 'success'
                    };
                  } else {
                    this.alert_message = {
                      show: true,
                      message: '无法同步数据到档案，请检查后端是否出现错误！',
                      type: 'error'
                    };
                  }
                });
                electron.ipcRenderer.send("command.sync_data", this.archive);
              }
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
.big_number {
  font-size: 50px;
  font-weight: bold;
  font-style: italic;
  font-family: Consolas;
}
</style>