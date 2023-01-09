<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-app style="height: 100%; width: 100%">
    <v-navigation-drawer
        permanent
        left
        style="position: fixed"
    >
      <template v-slot:prepend>
        <v-list-item two-line link @click="nightModeSwitch()">
          <v-list-item-avatar>
            <img src="@/assets/avatar.jpg" alt="我是傻逼">
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>蒸痔背書硝煮獸</v-list-item-title>
            <v-list-item-subtitle>Developed by Jerry Chou (Winghong Zau)</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            @click="nav_clicked(item.url)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div style="margin-left: 256px;">
      <router-view class="router-box" ></router-view>
    </div>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',
  methods: {
    nightModeSwitch() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    nav_clicked(path) {
      this.$router.push(path);
    }
  },
  components: {
    HelloWorld,
  },

  data: () => ({
    items: [{
      title: '主页',
      icon: 'mdi-home',
      url: '/'
    }, {
      title: '知识点预览',
      icon: 'mdi-book',
      url: '/book'
    }, {
      title: '背诵',
      icon: 'mdi-checkbox-marked-circle',
      url: '/reciting/menu'
    }, {
      title: '设置',
      icon: 'mdi-cog-outline',
      url: '/settings'
    }],
  }),
  created() {
    this.$router.push('/');
  }
};
</script>

<style scoped>
.router-box {
  margin: 10px;
}
</style>