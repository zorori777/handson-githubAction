// データ格納
export const state = () => ({
  list: [],
})

// データを操作する(同期的処理)
export const mutations = {
  // ID検索と編集/要素追加
  save(state, { id, data }) {
    const target = state.list.find((item) => item.id === id)
    if (target) {
      target.data = data
    } else {
      state.list.push({ id, data })
    }
  },
  // 日付順で並び替える
  sort(state) {
    state.list.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp))
  },
  // 要素追加
  add(state, { id, data }) {
    state.list.push({ id, data })
  },
  // 要素削除
  remove(state, id) {
    const index = state.list.findIndex((item) => item.id === id)
    state.list.splice(index, 1)
  },
  // 要素リセット
  reset(state) {
    sessionStorage.removeItem('markdownEditor')
    state.list = []
  },
}

// 非同期処理を実行する
export const actions = {
  // ローカルの情報が最新かチェックする
  async checkListLatest() {
    // セッションストレージの最新更新時間を取得
    const localList = await JSON.parse(sessionStorage.getItem('markdownEditor')).memos.list
    if (!localList) return
    const localUpdateItem = await localList.reduce((a, b) =>
      new Date(a.data.timestamp) > new Date(b.data.timestamp) ? a : b
    )
    const localUpdateTime = localUpdateItem.data.timestamp
    // Firestoreの最新更新時間を取得
    const db = this.$fire.firestore.collection('markdowns').orderBy('timestamp', 'desc').limit(1)
    let dbUpdateTime = new Date()
    try {
      const snapshot = await db.get()
      await snapshot.forEach((doc) => {
        dbUpdateTime = doc.data().timestamp
      })
    } catch (e) {
      alert(e)
      return
    }
    // ローカルとDBの最新更新時間比較
    if (new Date(localUpdateTime) < new Date(dbUpdateTime)) {
      return false
    } else {
      return true
    }
  },
  // FireStoreからデータを取得してリストを更新する
  async readDB(context) {
    // ローカルの情報が最新の場合Firestoreにアクセスしない
    const isListLatest = await context.dispatch('checkListLatest')
    if (isListLatest === true) return
    // データ取得
    await context.commit('reset')
    const db = this.$fire.firestore.collection('markdowns').orderBy('timestamp', 'desc')
    try {
      const snapshot = await db.get()
      snapshot.forEach((doc) => {
        context.commit('add', { id: doc.id, data: doc.data() })
      })
    } catch (e) {
      alert(e)
    }
  },
  // FireStoreの変更を検知してリストを更新する
  listenDB(context) {
    const db = this.$fire.firestore.collection('markdowns').orderBy('timestamp', 'desc').limit(1)
    try {
      db.onSnapshot(async (snapshot) => {
        await snapshot.forEach((doc) => {
          context.commit('save', { id: doc.id, data: doc.data() })
        })
        context.commit('sort')
      })
    } catch (e) {
      alert(e)
    }
  },
  // FireStoreに要素を保存する
  async saveDB(context, { saveId, saveData }) {
    await context.commit('save', { id: saveId, data: saveData })
    const db = this.$fire.firestore.collection('markdowns').doc(saveId)
    try {
      db.set({
        text: saveData.text,
        title: saveData.title,
        timestamp: saveData.timestamp,
      })
    } catch (e) {
      alert(e)
      // test
    }
  },
  // FireStoreの要素を削除する
  async removeDB(context, removeId) {
    await context.commit('remove', removeId)
    const db = this.$fire.firestore.collection('markdowns').doc(removeId)
    try {
      db.delete()
    } catch (e) {
      alert(e)
    }
  },
}
エラー原因の一文
