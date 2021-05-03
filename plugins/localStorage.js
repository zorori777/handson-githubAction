import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  window.onNuxtReady(() => {
    createPersistedState({ key: 'markdownEditor', storage: window.sessionStorage })(store)
  })
}
