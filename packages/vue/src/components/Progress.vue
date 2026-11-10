<script setup lang="ts">
import { computed } from "vue";
import { clampPercent } from "@acmeui/core";
const props=defineProps<{value:number;label?:string}>();
const safe=computed(()=>clampPercent(props.value));
</script>
<template><div class="acme-progress" role="progressbar" :aria-label="label||'進度'" :aria-valuenow="safe" aria-valuemin="0" aria-valuemax="100"><div class="acme-progress__bar" :style="{width:`${safe}%`}"/></div></template>
