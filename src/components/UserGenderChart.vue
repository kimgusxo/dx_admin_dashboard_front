<template>
  <div class="charts-container">
    <h3>성별 방문 고객 수</h3>
    <div class="chart-wrapper">
      <canvas ref="genderDoughnutChart"></canvas>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!isLoading && users.length === 0">고객 데이터가 없습니다.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Chart } from "chart.js";
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

const genderDoughnutChart = ref(null);
const chartInstance = ref(null);

const genderCounts = computed(() => {
  const counts = { male: 0, female: 0 };
  users.value.forEach((user) => {
    if (user.userGender === "남") counts.male++;
    if (user.userGender === "여") counts.female++;
  });
  return [counts.male, counts.female];
});

const initializeChart = () => {
  if (!genderDoughnutChart.value) return;

  const ctx = genderDoughnutChart.value.getContext("2d");
  chartInstance.value = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["남성", "여성"],
      datasets: [
        {
          data: genderCounts.value,
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 500,
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            generateLabels: (chart) => {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, i) => ({
                text: `${label} (${dataset.data[i]}명)`,
                fillStyle: dataset.backgroundColor[i],
                index: i,
              }));
            },
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset;
              const total = dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const currentValue =
                dataset.data[tooltipItem.dataIndex] || 0;
              const percentage = total
                ? ((currentValue / total) * 100).toFixed(2)
                : 0;
              return `${tooltipItem.label}: ${percentage}%`;
            },
          },
        },
      },
    },
  });
};

const updateChart = () => {
  if (chartInstance.value) {
    chartInstance.value.data.datasets[0].data = genderCounts.value;
    chartInstance.value.update();
  }
};

const fetchUsers = async () => {
  await userStore.fetchUsers(props.storeId);
  if (!chartInstance.value) {
    initializeChart();
  } else {
    updateChart();
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.charts-container {
  width: 510px;
  height: 340px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 20px;
}

.chart-wrapper {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 290px;
  margin-top: -20px;
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

.error {
  margin-top: 10px;
  color: red;
  font-size: 13px;
}
</style>
