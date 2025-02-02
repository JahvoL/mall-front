import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

let routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/front',
        name: 'Front',
        component: () => import("../layout/front"),
        children: [
            {
                path: 'home',
                name: 'FrontHome',
                component: () => import("../views/front/home")
            },
            {
                path: 'search',
                name: 'Search',
                component: () => import("../views/front/search")
            },
            {
                path: 'goods',
                name: 'Goods',
                component: () => import("../views/front/goods")
            },
            {
                path: 'cart',
                name: 'Cart',
                component: () => import("../views/front/cart")
            },
            {
                path: 'preOrder',
                name: 'PreOrder',
                component: () => import("../views/front/preOrder")
            },
            {
                path: 'order',
                name: 'FrontOrder',
                component: () => import("../views/front/order")
            },
            {
                path: 'person',
                name: 'Person',
                component: () => import("../views/front/person")
            },
            {
                path: 'address',
                name: 'Address',
                component: () => import("../views/front/address")
            },
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import("../views/login")
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import("../views/register")
    },
]


const createRouter = () => new VueRouter({
    mode: 'history',
    routes: routes
})

const router = createRouter()

let user = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : {}
resetRouter(user.permission)

//写一个重置路由的方法，切换用户后，或者退出时清除动态加载的路由
export function resetRouter(permissions) {
    if (permissions) {
        const newRouter = createRouter()
        router.matcher = newRouter.matcher // 新路由实例matcer，赋值给旧路由实例的matcher，（相当于replaceRouter）
        if (!router.getRoutes().find(v => v.name === 'Manage')) {
            router.addRoute(getPermissions(permissions))
        }
    }

}

function getPermissions(permissions) {
    let manage = {
        path: '/manage', name: 'Manage', component: () => import("../layout/manage"),
        children: [
            {path: 'person', name: '个人信息', component: () => import("../views/manage/person")}
        ]
    }
    // 设置路由菜单
    if (permissions) {
        permissions.forEach(item => {
            manage.children.push({
                path: "/manage" + item.path,
                name: item.name,
                component: () => import("../views/manage" + item.path)
            });
        })
    }
    return manage
}

export default router
