// import { AiOutlineApi } from 'react-icons/ai';
// import { IoHome } from 'react-icons/io5';
// import { CiCircleList } from 'react-icons/ci';
// import { CiSettings } from 'react-icons/ci';

// const menuItems = {
//   items: [
//     {
//       id: 'main',
//       title: 'Main',
//       type: 'group',
//       icon: AiOutlineApi,
//       children: [
//         {
//           id: 'dashboard',
//           title: 'Dashboard',
//           type: 'item',
//           icon: IoHome,
//           url: '/dashboard'
//         }
//       ]
//     },
//     {
//       id: 'apimanagement',
//       title: 'API Management',
//       type: 'group',
//       icon: AiOutlineApi,
//       children: [
//         {
//           id: 'keymanagement',
//           title: 'API List',
//           type: 'item',
//           icon: CiCircleList,
//           url: '/api-list',
//           children: [
//             {
//               id: 'apiintegration',
//               title: 'API Integration',
//               type: 'item',
//               url: '/api-integration'
//             },
//             {
//               id: 'apidetails',
//               type: 'item',
//               title: 'API Details',
//               url: '/api-detail/:id'
//             },
//             {
//               id: 'logdetails',
//               type: 'item',
//               title: 'Log Details',
//               url: '/api-detail/:id/key-detail/:key'
//             }
//           ]
//         }
//       ]
//     },
//     {
//       id: 'setting',
//       title: 'Setting',
//       type: 'group',
//       // icon: 'icon-ui',
//       children: [
//         {
//           id: 'setting',
//           title: 'Setting',
//           type: 'collapse',
//           icon: CiSettings,
//           children: [
//             // {
//             //   id: 'User',
//             //   title: 'User',
//             //   type: 'item',
//             //   // icon: CiSettings,
//             //   url: '/basic/tabs-pills'
//             // },
//             {
//               id: 'roles',
//               title: 'Role',
//               type: 'item',
//               url: '/setting/role'
//             }
//           ]
//         }
//       ]
//     }
//   ]
// };

// export default menuItems;

// menu-items.js
import { AiOutlineApi } from 'react-icons/ai';
import { IoHome } from 'react-icons/io5';
import { CiCircleList } from 'react-icons/ci';
// import { FaRegUser } from "react-icons/fa";
import { FaCog, FaPlay, FaUser } from "react-icons/fa";
import { RiUserSettingsFill } from "react-icons/ri";
import { RiUserLine } from "react-icons/ri";
import axios from 'axios';
import { api } from 'views/api';

// ---- Full Menu with permission keys ----
const allMenuItems = {
  items: [
    {
      id: 'main',
      title: 'Main',
      type: 'group',
      icon: AiOutlineApi,
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: IoHome,
          url: '/dashboard',
          permission: 'Dashboard'
        }
      ]
    },
    {
      id: 'main',
      title: 'Naver',
      type: 'group',
      icon: AiOutlineApi,
      children: [
        {
          id: 'naverdashboard',
          title: 'Dashboard',
          type: 'item',
          icon: IoHome,
          url: '/naver',
          permission: 'NaverDashboard'
        }
      ]
    },
    {
      id: 'apimanagement',
      title: 'API Management',
      type: 'group',
      icon: AiOutlineApi,
      children: [
        {
          id: 'keymanagement',
          title: 'API List',
          type: 'item',
          icon: CiCircleList,
          url: '/api-list',
          permission: 'Api_List',
          children: [
            {
              id: 'apiintegration',
              title: 'API Integration',
              type: 'item',
              url: '/api-integration',
              permission: 'Api_List'
            },
            {
              id: 'apidetails',
              type: 'item',
              title: 'API Details',
              url: '/api-detail/:id',
              permission: 'Api_key_Details'
            },
            {
              id: 'logdetails',
              type: 'item',
              title: 'Log Details',
              url: '/api-detail/:id/key-detail/:key/:domain',
              permission: 'Api_key_Details'
            }
          ]
        }
      ]
    },
    {
      id: 'management',
      title: 'Management',
      type: 'group',
      children: [
        {
          id: 'roles',
          title: 'Role',
          type: 'item',
          url: '/setting/role',
          icon: FaCog,
          permission: 'Role'
        },
        {
          id: 'users',
          title: 'User',
          type: 'item',
          url: '/setting/user',
          icon: RiUserLine,
          permission: 'User'
        }
      ]
    }
  ]
};

// ---- Filter function ----
const filterMenuByPermissions = (menu, permissions) => {
  const filterChildren = (children = []) =>
    children
      .filter((child) => !child.permission || permissions.includes(child.permission))
      .map((child) => ({
        ...child,
        children: child.children ? filterChildren(child.children) : undefined
      }));

  return {
    ...menu,
    items: menu.items
      .map((group) => ({
        ...group,
        children: filterChildren(group.children)
      }))
      .filter((group) => group.children && group.children.length > 0)
  };
};

// ---- Fetch Permissions + Export Menu ----
// fallback if API fails

// (async () => {
//   try {
//     const res = await axios.get(`${api}/get-rolebase-permission`, { withCredentials: true });
//     const permissions = res.data;
//     console.log('permissions++++++++', res);
//     menuItems = filterMenuByPermissions(allMenuItems, permissions);
//     console.log('menuItems +++++++++', menuItems);
//   } catch (error) {
//     console.error('Error fetching permissions:', error);
//   }
// })();

const getMenu = async () => {
  try {
    const res = await axios.get(`${api}/get-rolebase-permission`, { withCredentials: true });
    const permissions = res.data;
    // console.log('permissions++++++++', res);
    return filterMenuByPermissions(allMenuItems, permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return allMenuItems;
  }
};
const menuItems = await getMenu();
console.log('menuItems', menuItems);
export default menuItems;
