<template>
  <div class="customer-table-wrapper">
    <h3>매장 방문 고객 리스트</h3>
    <p v-if="isLoading">데이터를 로드 중입니다...</p>
    <p v-if="error">{{ error }}</p>
    <div class="customer-table" v-if="!isLoading && !error">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>
              <div class="filter">
                <select
                  id="gender-filter"
                  v-model="filters.gender"
                  @change="onFilterChange"
                >
                  <option value="all">성별</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>
            </th>
            <th>나이</th>
            <th>
              <div class="filter">
                <select
                  id="subscription-filter"
                  v-model="filters.subscription"
                  @change="onFilterChange"
                >
                  <option value="all">구독 여부</option>
                  <option value="구독">구독</option>
                  <option value="미구독">미구독</option>
                </select>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(customer, index) in filteredCustomers"
            :key="index"
            class="row"
          >
            <td>{{ customer.userName }}</td>
            <td>{{ customer.userGender }}</td>
            <td>{{ customer.userAge }}</td>
            <td>{{ customer.isSubscribe ? "구독" : "미구독" }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredCustomers.length === 0">
        조건에 맞는 고객 데이터가 없습니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const userStore = useUserStore();

const users = computed(() => userStore.users);
const isLoading = computed(() => userStore.isLoading);
const error = computed(() => userStore.error);

const filters = ref({
  gender: "all",
  subscription: "all",
});

const filteredCustomers = computed(() => {
  const { gender, subscription } = filters.value;
  return users.value.filter((customer) => {
    const matchesGender =
      gender === "all" || customer.userGender === gender;
    const matchesSubscription =
      subscription === "all" ||
      (subscription === "구독"
        ? customer.isSubscribe
        : !customer.isSubscribe);
    return matchesGender && matchesSubscription;
  });
});

const fetchUsers = async () => {
  await userStore.fetchUsers(props.storeId);
};

const onFilterChange = () => {
  // 필터링은 computed에서 처리하므로 여기서는 따로 로직 불필요
};

onMounted(fetchUsers);
</script>

<style scoped>
.customer-table-wrapper {
  width: 380px;
  height: 750px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
  overflow: hidden;
}

h3 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  border-radius: 8px;
  background-color: #FFD1A7;
  padding: 20px;
  margin-top: 0px;
}

select {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-color: #FFF7EF;
  background-color: #FFF7EF;
  padding: 0;
}

option {
  background-color: white;
}

.customer-table {
  max-height: 80%;
  overflow-x: hidden;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff7ef;
}

thead th {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #eee;
  padding: 15px;
}

tbody td {
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding: 15px;
  text-align: center;
}

.row:hover {
  transform: scale(1.02);
}

.row {
  transition: transform 0.2s ease-in-out;
  cursor: default;
}
</style>
