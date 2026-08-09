import { createApp } from 'vue'
import './styles/base.css'
import App from './App.vue'

// The page opens on a designed load sequence, so a restored scroll offset
// would drop the visitor into the middle of the narrative.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

createApp(App).mount('#app')
