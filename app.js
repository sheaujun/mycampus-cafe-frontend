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

      <p v-if="loginMessage" :class="loginMessageType">{{ loginMessage }}</p>

      <hr>

      <input v-model="newMenu.menu_name" placeholder="Menu name">
      <input v-model="newMenu.category" placeholder="Category">
      <input v-model="newMenu.price" placeholder="Price">

      <select v-model="newMenu.availability">
        <option>Available</option>
        <option>Unavailable</option>
      </select>

      <button @click="addMenu">Add Menu</button>

      <p v-if="menuMessage" :class="menuMessageType">{{ menuMessage }}</p>
    </div>
  `,

  data() {
    return {
      loginMessage: '',
      loginMessageType: '',
      menuMessage: '',
      menuMessageType: '',
      loginForm: { username: '', password: '' },
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
          this.loginMessage = 'Login successful.';
          this.loginMessageType = 'success-message';
        } else {
          this.loginMessage = data.message || 'Login failed.';
          this.loginMessageType = 'error-message';
        }
      })
      .catch(error => {
        this.loginMessage = 'Login failed because server cannot be reached.';
        this.loginMessageType = 'error-message';
        console.error('Login error:', error);
      });
    },

    logoutStaff() {
      localStorage.removeItem('mcafe_token');
      this.loginMessage = 'You have logged out.';
      this.loginMessageType = 'success-message';
    },

    addMenu() {
      if (!getToken()) {
        this.menuMessage = 'Please login first before adding menu.';
        this.menuMessageType = 'error-message';
        return;
      }

      fetch(API_BASE_URL + '/menu', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(this.newMenu)
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.menuMessage = 'Menu item added successfully.';
          this.menuMessageType = 'success-message';
          this.newMenu = {
            menu_name: '',
            category: '',
            price: '',
            availability: 'Available'
          };
        } else {
          this.menuMessage = data.message || 'Failed to add menu item.';
          this.menuMessageType = 'error-message';
        }
      })
      .catch(error => {
        this.menuMessage = 'Failed to add menu item.';
        this.menuMessageType = 'error-message';
        console.error('Add menu error:', error);
      });
    }
  }
};

const ViewMenu = {
  template: `
    <div>
      <h2>View Menu</h2>

      <button @click="fetchMenu">Refresh Menu</button>

      <p v-if="message" :class="messageType">{{ message }}</p>

      <table border="1" cellpadding="8">
        <tr>
          <th>ID</th>
          <th>Menu Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Availability</th>
          <th>Action</th>
        </tr>

        <tr v-for="item in menuItems" :key="item.menu_id">
          <td>{{ item.menu_id }}</td>
          <td>{{ item.menu_name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.availability }}</td>
          <td>
            <button @click="deleteMenu(item.menu_id)">Delete</button>
          </td>
        </tr>
      </table>
    </div>
  `,

  data() {
    return {
      menuItems: [],
      message: '',
      messageType: ''
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
        })
        .catch(error => {
          this.message = 'Failed to load menu data.';
          this.messageType = 'error-message';
          console.error('Fetch menu error:', error);
        });
    },

    deleteMenu(id) {
      if (!getToken()) {
        this.message = 'Please login first before deleting menu.';
        this.messageType = 'error-message';
        return;
      }

      fetch(API_BASE_URL + '/menu/' + id, {
        method: 'DELETE',
        headers: authHeaders()
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          this.message = 'Menu item deleted successfully.';
          this.messageType = 'success-message';
          this.fetchMenu();
        } else {
          this.message = data.message || 'Failed to delete menu item.';
          this.messageType = 'error-message';
        }
      })
      .catch(error => {
        this.message = 'Failed to delete menu item.';
        this.messageType = 'error-message';
        console.error('Delete menu error:', error);
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