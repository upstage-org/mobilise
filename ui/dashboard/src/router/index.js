import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import store from "@/store";
import config from '../../vue.config';
import PleaseRotate from '@/utils/pleaserotate';

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: Home
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
      },
      {
        path: '/stage',
        name: 'Stages',
        component: () => import('../views/Stage.vue')
      },
    ]
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/Layout.vue'),
    meta: { requireAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
      },
      {
        path: '/dashboard/workshop',
        name: 'Workshop',
        component: () => import('../views/dashboard/Workshop.vue'),
      },
      {
        path: '/dashboard/media',
        name: 'Media',
        component: () => import('../views/dashboard/Media/index.vue'),
      },
      {
        path: '/dashboard/profile',
        component: () => import('../views/dashboard/Profile/index.vue'),
        children: [
          {
            path: '',
            name: 'Player Profile',
            component: () => import('../views/dashboard/Profile/Information.vue'),
          },
          {
            path: 'change-password',
            name: 'Change Password',
            component: () => import('../views/dashboard/Profile/ChangePassword.vue'),
          },
        ]
      },
      {
        path: '/dashboard/admin',
        component: () => import('../views/dashboard/Admin/index.vue'),
        children: [
          {
            path: '',
            redirect: '/dashboard/admin/approval',
          },
          {
            path: 'approval',
            name: 'Registration Approval',
            component: () => import('../views/dashboard/Admin/RegistrationApproval.vue'),
          },
          {
            path: 'reset-password',
            name: 'Reset Password',
            component: () => import('../views/dashboard/Admin/ResetPassword.vue'),
          },
          {
            path: 'switch-role',
            name: 'Switch Role',
            component: () => import('../views/dashboard/Admin/SwitchRole.vue'),
          },
          {
            path: 'delete-user',
            name: 'Delete User',
            component: () => import('../views/dashboard/Admin/DeleteUser.vue'),
          },
          {
            path: 'profile-management',
            name: 'Profile Management',
            component: () => import('../views/dashboard/Admin/ProfileManagement.vue'),
          },
          {
            path: 'upload-limit',
            name: 'Upload Limit',
            component: () => import('../views/dashboard/Admin/UploadLimit.vue'),
          },
          {
            path: 'system-configurations',
            name: 'System Configurations',
            component: () => import('../views/dashboard/Admin/SystemConfigurations.vue'),
          },
        ]
      },
      {
        path: '/dashboard/new-stage',
        component: () => import('../views/dashboard/StageManagement/index.vue'),
        children: [
          {
            path: '',
            name: 'Create New Stage',
            component: () => import('../views/dashboard/StageManagement/General.vue'),
          },
        ]
      },
      {
        path: '/dashboard/stage-management/:id',
        component: () => import('../views/dashboard/StageManagement/index.vue'),
        props: route => ({ id: route.params.id }),
        children: [
          {
            path: '',
            name: 'Stage Management',
            component: () => import('../views/dashboard/StageManagement/General.vue'),
          },
          {
            name: 'Stage Layout',
            path: 'layout',
            component: () => import('../views/dashboard/StageManagement/Layout.vue'),
          },
          {
            name: 'Stage Media',
            path: 'media',
            component: () => import('../views/dashboard/StageManagement/Media.vue'),
          },
          {
            name: 'Chat',
            path: 'chat',
            component: () => import('../views/dashboard/StageManagement/Chat.vue'),
          },
          {
            name: 'Scenes',
            path: 'scenes',
            component: () => import('../views/dashboard/StageManagement/Scenes.vue'),
          },
          {
            name: 'Records',
            path: 'records',
            component: () => import('../views/dashboard/StageManagement/Records.vue'),
          }
        ]
      }
    ]
  },

  {
    path: '/live/:url?',
    name: 'Live',
    component: () => import('../views/live/Layout.vue'),
  },
  {
    path: '/replay/:url/:id',
    name: 'Replay Record',
    component: () => import('../views/replay/Layout.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(config.publicPath),
  routes
})

router.beforeEach((to, from, next) => {
  document.body.classList.add('waiting');

  const loggedIn = store.getters["auth/loggedIn"];

  if (to.matched.some((record) => record.meta.requireAuth) && !loggedIn) {
    next("/login");
  }
  if (to.name === 'Login' && loggedIn) {
    next("/dashboard");
  }
  if (to.name === 'Live') {
    document.querySelector("meta[name=viewport]").setAttribute("content", "");
    PleaseRotate.start();
  } else {
    document.querySelector("meta[name=viewport]").setAttribute("content", "width=device-width,initial-scale=1.0");
    PleaseRotate.stop();
  }
  next();
  document.title = `UpStage ${to.name && '- ' + to.name}`;
});

router.afterEach(() => {
  document.body.classList.remove('waiting');
});

export default router
