<template>
  <v-app>
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
        <v-card-title>设置</v-card-title>
        <v-card-subtitle>调整 蒸痔背書硝煮獸 的行为和设定</v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field
              label="使用提纲"
              hide-details="auto"
              v-model="settings.use_book"
          ></v-text-field>

          <div style="margin-top: 20px;"></div>

          <v-text-field label="一日新背知识点数" v-model="settings.goal_per_day">
            <v-icon slot="append" color="green" link @click="settings.goal_per_day--">
              mdi-minus
            </v-icon>
            <v-icon slot="append" color="red" link @click="settings.goal_per_day++">
              mdi-plus
            </v-icon>
          </v-text-field>

          <v-text-field label="一日复习知识点数" v-model="settings.review_per_day">
            <v-icon slot="append" color="green" link @click="settings.review_per_day--">
              mdi-minus
            </v-icon>
            <v-icon slot="append" color="red" link @click="settings.review_per_day++">
              mdi-plus
            </v-icon>
          </v-text-field>
          <v-btn
              depressed
              color="primary"
              @click="save_changes()"
              :disabled="btn_save_changes_disabled"
          >
            <v-icon>mdi-ok</v-icon>
            Save changes
          </v-btn>
        </v-card-text>
      </v-card>
    </v-app>
  </v-app>
</template>

<script>
const electron = window.require('electron');

export default {
  name: "settings-panel",
  data: () => ({
    settings: {
      use_book: '',
      goal_per_day: '0',
      review_per_day: '0',
    },
    archive: {},
    btn_save_changes_disabled: false,
    alert_message: {
      show: false,
      message: "",
      type: "error"
    }
  }),
  methods: {
    get_archive() {
      electron.ipcRenderer.on('command.read_data.callback', (event, args) => {
        electron.ipcRenderer.removeAllListeners('command.read_data.callback');
        if (args.status) {
          console.log('ipc callback.')
          this.archive = args.data;
          this.settings.use_book = this.archive.use_book;
          this.settings.review_per_day = this.archive.review_per_day;
          this.settings.goal_per_day = this.archive.goal_per_day;
        } else {
          this.ok_dialog = {
            title: '错误',
            message: '加载存档失败! 请检查程序是否完整且拥有读写文件的权限!',
            ok_button_text: '确定'
          };
          this.show_ok_dialog = true;
        }
      });
      electron.ipcRenderer.send('command.read_data');
    },
    save_changes() {
      this.btn_save_changes_disabled = true;
      this.archive.use_book = this.settings.use_book;
      this.archive.review_per_day = this.settings.review_per_day;
      this.archive.goal_per_day = this.settings.goal_per_day;
      electron.ipcRenderer.on('command.sync_data.callback', (event, args) => {
        electron.ipcRenderer.removeAllListeners('command.sync_data.callback');
        console.log(args)
        if (args.status) {
          console.log('ipc callback.')
          this.alert_message = {
            show: true,
            type: 'success',
            message: "保存设置成功",
          };
        } else {
          this.alert_message = {
            show: true,
            type: 'error',
            message: "无法保存你的设置, 请检查后端是否出现错误!",
          };
        }
        this.btn_save_changes_disabled = false;
      });
      electron.ipcRenderer.send('command.sync_data', this.archive);
    }
  },
  created() {
    this.get_archive();
  }
}
</script>

<style scoped>

</style>