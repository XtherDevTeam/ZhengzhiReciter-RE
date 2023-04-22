import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from "@/views/HomePage"
import BookPreview from "@/views/BookPreview";
import Settings from "@/views/Settings";
import RecitingMenu from "@/views/RecitingMenu";
import RecitingStart from "@/views/RecitingStart";
import RecitingFinished from "@/views/RecitingFinished";
import About from "@/views/About.vue";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/book',
        name: 'book',
        component: BookPreview
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings
    },

    {
        path: '/about',
        name: 'about',
        component: About
    },
    {
        path: '/reciting/menu',
        name: 'reciting-menu',
        component: RecitingMenu
    },
    {
        path: '/reciting/start',
        name: 'reciting-start',
        component: RecitingStart
    },
    {
        path: '/reciting/finished',
        name: 'reciting-finished',
        component: RecitingFinished
    }
]

const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes
})

export default router
