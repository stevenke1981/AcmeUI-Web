<script setup lang="ts">
import { initials } from '@acmeui/core';
defineProps<{src?:string;name:string}>();
</script>
<template><span class="acme-avatar"><img v-if="src" :src="src" :alt="name"/><span v-else role="img" :aria-label="name">{{initials(name)}}</span></span></template>
