<template>
  <v-row>
    <!-- テキスト追加カード -->
    <v-col cols="12" sm="3">
      <NewCardComponent />
    </v-col>
    <!-- カードリスト -->
    <v-col v-for="memo in memos" :key="memo.id" cols="12" sm="3">
      <CardComponent :memo="memo" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  // ページ読み込み時に毎回実行する処理
  async fetch() {
    // store/memos.js/readDB,listeDBを実行
    await this.$store.dispatch('memos/readDB')
    this.$store.dispatch('memos/listenDB')
  },
  // 計算した値をとる変数
  computed: {
    memos() {
      // store/memos.js/listを取得
      return this.$store.state.memos.list
    },
  },
}
</script>
