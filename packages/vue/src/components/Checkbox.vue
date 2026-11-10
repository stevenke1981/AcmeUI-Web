<script setup lang="ts">
defineOptions({inheritAttrs:false});
defineProps<{modelValue?:boolean;label:string}>();
defineEmits<{(e:"update:modelValue",value:boolean):void}>();
</script>
<template><label class="acme-checkbox"><input v-bind="$attrs" type="checkbox" :checked="modelValue" @change="$emit('update:modelValue',($event.target as HTMLInputElement).checked)"/><span>{{label}}</span></label></template>
