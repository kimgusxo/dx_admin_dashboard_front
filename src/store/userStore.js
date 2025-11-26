import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [],            // 매장별 전체 고객
    topMealKitsByAge: {   // 나이대별 1등 밀키트
      "20대": null,
      "30대": null,
      "40대": null,
      "50대": null,
    },
    malePreferences: [],   // 남성 선호 TOP5
    femalePreferences: [], // 여성 선호 TOP5

    isLoading: false,
    error: null,
  }),

  actions: {
    // 매장별 고객 리스트
    async fetchUsers(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await axios.get("/users", {
          params: { storeId },
        });
        this.users = data;
      } catch (err) {
        console.error(err);
        this.error = "고객 데이터를 불러오는 데 실패했습니다.";
        this.users = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 나이대별 선호 밀키트 (20, 30, 40, 50대)
    async fetchTopMealKitsByAge(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const ageGroups = [20, 30, 40, 50];
        const result = {};

        for (const age of ageGroups) {
          const { data } = await axios.get("/users/age", {
            params: { storeId, userAge: age },
          });

          const topMealKit =
            data && data.length > 0
              ? data
                  .slice()
                  .sort((a, b) => b.totalSales - a.totalSales)[0]
              : null;

          result[`${age}대`] = topMealKit;
        }

        this.topMealKitsByAge = result;
      } catch (err) {
        console.error("Error fetching top meal kits by age:", err);
        this.error = "연령별 선호 밀키트 데이터를 불러오는 데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    // 성별 선호 밀키트
    async fetchGenderPreferences(storeId) {
      this.isLoading = true;
      this.error = null;

      try {
        const maleResponse = await axios.get("/users/gender", {
          params: { storeId, userGender: "남" },
        });
        const femaleResponse = await axios.get("/users/gender", {
          params: { storeId, userGender: "여" },
        });

        this.malePreferences = (maleResponse.data ?? [])
          .slice()
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);

        this.femalePreferences = (femaleResponse.data ?? [])
          .slice()
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);
      } catch (err) {
        console.error("Error fetching gender preferences:", err);
        this.error = "성별 선호 밀키트 데이터를 불러오는 데 실패했습니다.";
        this.malePreferences = [];
        this.femalePreferences = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
