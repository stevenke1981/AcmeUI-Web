<script setup lang="ts">
import { computed, ref } from "vue";
const props=withDefaults(defineProps<{modelValue?:boolean;defaultChecked?:boolean;label?:string;disabled?:boolean}>(),{modelValue:undefined,defaultChecked:false,disabled:false});
const emit=defineEmits<{(e:"update:modelValue",value:boolean):void}>();
const state=ref(props.defaultChecked),current=computed(()=>props.modelValue??state.value);
function toggle(event:MouseEvent){if(props.disabled||event.defaultPrevented)return;const next=!current.value;if(props.modelValue===undefined)state.value=next;emit("update:modelValue",next)}
</script>
<template><button type="button" role="switch" class="acme-switch" :disabled="disabled" :aria-checked="current" :aria-label="label||'切換'" :data-checked="String(current)" @click="toggle"/></template>
