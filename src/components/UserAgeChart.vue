<template>
  <div class="charts-container">
    <h3>연령별 방문 고객 수</h3>
    <div class="chart-wrapper">
      <canvas ref="agePolarChart"></canvas>
    </div>
    <p v-if="isLoading">데이터를 로드 중입니다...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { Chart } from "chart.js";
import { useUserStore } from "@/store/userStore";

const props = defineProps({
  storeId: {
    type: Number,
    default: 1,
  },
});

const userStore = useUserStore();

// Pinia 상태
const users = computed(() => userStore.users);
const isLoading = computed(() => userStore.isLoading);
const error = computed(() => userStore.error);

// Chart 참조
const agePolarChart = ref(null);
const chartInstance = ref(null);

// 연령별 데이터 계산
const ageGroupCounts = computed(() => {
  const counts = {
    "10-19": 0,
    "20-29": 0,
    "30-39": 0,
    "40-49": 0,
    "50+": 0,
  };
  users.value.forEach((user) => {
    const age = user.userAge;
    if (age >= 10 && age <= 19) counts["10-19"]++;
    else if (age >= 20 && age <= 29) counts["20-29"]++;
    else if (age >= 30 && age <= 39) counts["30-39"]++;
    else if (age >= 40 && age <= 49) counts["40-49"]++;
    else if (age >= 50) counts["50+"]++;
  });
  return counts;
});

// 차트 렌더링
const renderChart = () => {
  if (!agePolarChart.value) return;

  const ctx = agePolarChart.value.getContext("2d");

  const dataArray = [
    ageGroupCounts.value["10-19"],
    ageGroupCounts.value["20-29"],
    ageGroupCounts.value["30-39"],
    ageGroupCounts.value["40-49"],
    ageGroupCounts.value["50+"],
  ];

  if (chartInstance.value) {
    chartInstance.value.data.datasets[0].data = dataArray;
    chartInstance.value.update();
  } else {
    chartInstance.value = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["10-19세", "20-29세", "30-39세", "40-49세", "50세 이상"],
        datasets: [
          {
            data: dataArray,
            borderWidth: 0,
            borderAlign: "inner",
            borderColor: "#FFFFFF",
            backgroundColor: [
              "rgba(244, 162, 97, 0.8)", // 주황색
              "rgba(231, 111, 81, 0.8)", // 빨강
              "rgba(233, 196, 106, 0.8)", // 황토색
              "rgba(42, 157, 143, 0.8)", // 청록색
              "rgba(38, 70, 83, 0.8)", // 어두운 청록색
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: 12,
              },
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                return chart.data.labels.map((label, i) => ({
                  text: `${label} (${dataset.data[i]}명)`,
                  fillStyle: dataset.backgroundColor[i],
                  index: i,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce(
                  (acc, value) => acc + value,
                  0
                );
                const value = context.raw;
                const percentage = total
                  ? ((value / total) * 100).toFixed(2)
                  : 0;
                return `${context.label}: ${value}명 (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
};

// 데이터 변경 시 차트 업데이트
watch(
  users,
  async (newVal) => {
    if (newVal.length > 0) {
      await nextTick();
      renderChart();
    }
  },
  { immediate: false }
);

// 데이터 로드
const fetchUsers = async () => {
  await userStore.fetchUsers(props.storeId);
};

onMounted(fetchUsers);
</script>

<style scoped>
.charts-container {
  width: 330px;
  height: 340px;
  font-family: Arial, sans-serif;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
}

.chart-wrapper {
  height: 310px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 300px;
  margin-top: -70px;
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

.error-text {
  margin-top: 10px;
  color: red;
  font-size: 13px;
}
</style>
