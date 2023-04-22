<template>
  <v-app>
    <v-app>
      <v-card
          elevation="2">
        <v-img
            height="250"
            src="@/assets/background_hw_2.jpg"
        ></v-img>
        <v-card-title>关于</v-card-title>
        <v-card-subtitle>关于 蒸痔背書硝煮獸 和 软件作者</v-card-subtitle>
        <v-divider></v-divider>
        <v-card-text>
            <p>ZhengzhiReciter-RE (蒸痔背書硝煮獸) 2023 Summer Edition</p>
            <p>Made with ❤️ by Jerry Chau (<a href="#" @click="window_open('https://github.com/xiaokang00010')">Xiaokang00010</a>)</p>
            <p>一款适用于就读于中国大陆的初中生、用于辅助背诵政治知识点的软件。</p>
            <p>I held the world aloft in my hands Yet I had nothing but a guise</p>
            <p>Till I saw the ordinary is the only answer.</p>
        </v-card-text>
      </v-card>
    </v-app>
  </v-app>
</template>

<script>
const electron = window.require('electron')

export default {
  name: "settings-panel",
  data: () => ({}),
  methods: {
      window_open(url) {
          window.open(url)
      }
  },
  created() {
  }
}
</script>

<style scoped>

</style>