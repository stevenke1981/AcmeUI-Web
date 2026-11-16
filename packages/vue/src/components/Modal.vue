<script setup lang="ts">
import{onBeforeUnmount,ref,useId,watch}from"vue";
import{activateModal}from"@acmeui/core";
const props=defineProps<{open:boolean;title:string}>();
const emit=defineEmits<{(e:"close"):void}>();
const id=useId();
const panel=ref<HTMLElement|null>(null);
let release:(()=>void)|undefined;
watch(panel,node=>{release?.();release=undefined;if(node)release=activateModal(node,()=>emit("close"))},{flush:"post"});
onBeforeUnmount(()=>{release?.();release=undefined});
function onBackdropMouseDown(event:MouseEvent){if(!event.defaultPrevented&&event.button===0&&event.target===event.currentTarget){event.preventDefault();emit("close")}}
function onCloseClick(event:MouseEvent){if(!event.defaultPrevented)emit("close")}
</script>
<template><div v-if="open" class="acme-modal" role="presentation" @mousedown="onBackdropMouseDown"><section ref="panel" class="acme-modal__panel" role="dialog" aria-modal="true" :aria-labelledby="id" tabindex="-1"><div class="acme-cluster" style="justify-content:space-between"><h2 :id="id">{{title}}</h2><button type="button" class="acme-button acme-button--ghost" aria-label="關閉" @click="onCloseClick">×</button></div><slot/></section></div></template>
