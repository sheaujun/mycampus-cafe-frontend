const Home = {
  template: `<h2>Welcome to MyCampus Café</h2>`
};

const AddMenu = {
  template: `
    <div>
      <h2>Add Menu</h2>

      <h3>Staff Login</h3>
      <input v-model="loginForm.username" placeholder="Username">
      <input v-model="loginForm.password" type="password" placeholder="Password">
      <button @click="loginStaff">Login</button>
      <button @click="logoutStaff">Logout</button>

      <hr>

      <input v-model="newMenu.menu_name" placeholder="Menu name">
      <input v-model="newMenu.category" placeholder="Category">
      <input v-model="newMenu.price" placeholder="Price">

      <select v-model="newMenu.availability">
        <option>Available</option>
        <option>Unavailable</option>
      </select>

      <button @click="addMenu">Add Menu</button>
    </div>
  `,

  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      newMenu: {
        menu_name: '',
        category: '',
        price: '',
        availability: 'Available'
      }
    };
  },

  methods: {
    loginStaff() {
      fetch(API_BASE_URL + '/login', {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify(this.loginForm)
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('mcafe_token', data.token);
          alert('Login successful');
        } else {
          alert(data.message || 'Login failed');
        }
      });
    },

    logoutStaff() {
      localStorage.removeItem('mcafe_token');
      alert('Logged out');
    },

    addMenu() {
      if (!getToken()) {
        alert('Please login first');
        return;
      }

      fetch(API_BASE_URL + '/menu', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(this.newMenu)
      })
      .then(response => response.json())
      .then(() => {
        alert('Menu item added');
        this.newMenu = {
          menu_name: '',
          category: '',
          price: '',
          availability: 'Available'
        };
      });
    }
  }
};

const ViewMenu = {
  template: `
    <div>
      <h2>View Menu</h2>

      <button @click="fetchMenu">Refresh Menu</button>

      <table border="1" cellpadding="8">
        <tr>
          <th>ID</th>
          <th>Menu Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Availability</th>
          <th>Action</th>
        </tr>

        <tr v-for="item in menuItems" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.menu_name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.availability }}</td>
          <td>
            <button @click="deleteMenu(item.id)">Delete</button>
          </td>
        </tr>
      </table>
    </div>
  `,

  data() {
    return {
      menuItems: []
    };
  },

  mounted() {
    this.fetchMenu();
  },

  methods: {
    fetchMenu() {
      fetch(API_BASE_URL + '/menu')
        .then(response => response.json())
        .then(data => {
          this.menuItems = data;
        });
    },

    deleteMenu(id) {
      if (!getToken()) {
        alert('Please login first');
        return;
      }

      fetch(API_BASE_URL + '/menu/' + id, {
        method: 'DELETE',
        headers: authHeaders()
      })
      .then(response => response.json())
      .then(() => {
        alert('Menu item deleted');
        this.fetchMenu();
      });
    }
  }
};

const routes = [
  { path: '/', component: Home },
  { path: '/add-order', component: AddMenu },
  { path: '/view-orders', component: ViewMenu }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes
});

const app = Vue.createApp({
  data() {
    return {
      appTitle: 'MyCampus Café Menu'
    };
  }
});

app.use(router);
app.mount('#app');