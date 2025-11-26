// src/store/HomeApplianceStore.js
import { defineStore } from "pinia";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8081";

export const useHomeApplianceStore = defineStore("homeApplianceStore", {
  state: () => ({
    appliances: [],        // 전체 가전 리스트
    brokenAppliances: [],  // 고장 상태 가전 리스트

    loading: {
      appliances: false,
      broken: false,
    },
    error: {
      appliances: null,
      broken: null,
    },
  }),

  getters: {
    isLoadingAppliances: (state) => state.loading.appliances,
    isLoadingBroken: (state) => state.loading.broken,
    appliancesError: (state) => state.error.appliances,
    brokenError: (state) => state.error.broken,
  },

  actions: {
    // 매장별 전체 가전 리스트
    async fetchAppliances(storeId) {
      this.loading.appliances = true;
      this.error.appliances = null;

      try {
        const { data } = await axios.get("/homeAppliances", {
          params: { storeId },
        });

        this.appliances = data.map((appliance) => ({
          id: appliance.homeAppliancesId,
          name: appliance.homeAppliancesName,
          model: appliance.homeAppliancesModelName,
          category: appliance.homeAppliancesClassification,
          status: appliance.homeAppliancesState ?? "정상",
        }));
      } catch (err) {
        console.error(err);
        this.error.appliances = "가전 리스트를 불러오는 데 실패했습니다.";
      } finally {
        this.loading.appliances = false;
      }
    },

    // 매장별 '고장' 상태 가전 리스트
    async fetchBrokenAppliances(storeId) {
      this.loading.broken = true;
      this.error.broken = null;

      try {
        const { data } = await axios.get("/homeAppliances/state", {
          params: { storeId, homeAppliancesState: "고장" },
        });

        this.brokenAppliances = data.map((appliance) => ({
          id: appliance.homeAppliancesId,
          name: appliance.homeAppliancesName,
          model: appliance.homeAppliancesModelName,
          category: appliance.homeAppliancesClassification,
          status: "고장",
        }));
      } catch (err) {
        console.error(err);
        this.error.broken = "고장난 가전 리스트를 불러오는 데 실패했습니다.";
      } finally {
        this.loading.broken = false;
      }
    },

    clear() {
      this.appliances = [];
      this.brokenAppliances = [];
      this.loading.appliances = false;
      this.loading.broken = false;
      this.error.appliances = null;
      this.error.broken = null;
    },
  },
});
