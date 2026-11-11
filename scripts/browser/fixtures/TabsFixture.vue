<script setup lang="ts">
import { Tabs } from '../../../packages/vue/src/index';
</script>
<template><main class="acme-container"><h1>Tabs keyboard</h1><Tabs :items="[{ value: 'a', label: 'Alpha', content: 'First' }, { value: 'b', label: 'Beta', content: 'Second' }]"/></main></template>
