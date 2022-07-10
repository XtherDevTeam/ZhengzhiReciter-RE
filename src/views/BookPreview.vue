<template>
  <v-app>
    <v-card
        elevation="2">
      <v-img
          height="250"
          src="@/assets/background.jpg"
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
      <v-card-title>知识点预览</v-card-title>
      <v-card-subtitle>预览提纲内的所有知识点</v-card-subtitle>
      <v-divider></v-divider>
      <v-expansion-panels>
        <v-expansion-panel
            v-for="(item, i) in library"
            :key="i"
        >
          <v-expansion-panel-header>
            {{ library[i].title }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <ul>
              <li v-for="point in library[i].points" :key="point">
                {{ point }}
              </li>
            </ul>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
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
  }),
  created() {
    electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
      console.log(args)
      if (args.status) {
        console.log('ipc callback.')
        this.archive = args.data;

        electron.ipcRenderer.on('command.get_library.callback', (event, args) => {
          if (args.status) {
            console.log('load success')
            console.log(args)
            this.library = args.data;
            console.log(this.library);
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