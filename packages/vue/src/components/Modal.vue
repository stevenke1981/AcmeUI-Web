<script setup lang="ts">
import{nextTick,onBeforeUnmount,ref,useId,watch}from"vue";
import{getFocusable,trapTabKey}from"@acmeui/core";
const props=defineProps<{open:boolean;title:string}>();
const emit=defineEmits<{(e:"close"):void}>();
const id=useId();
const panel=ref<HTMLElement|null>(null);
let opener:HTMLElement|null=null;
function onKey(e:KeyboardEvent){if(e.key==="Escape"){e.preventDefault();emit("close")}else if(panel.value)trapTabKey(e,panel.value)}
function release(){document.removeEventListener("keydown",onKey);const target=opener;opener=null;if(target?.isConnected)target.focus()}
watch(()=>props.open,async open=>{if(open){opener=document.activeElement instanceof HTMLElement?document.activeElement:null;document.addEventListener("keydown",onKey);await nextTick();const node=panel.value;if(node)(getFocusable(node)[0]??node).focus()}else release()},{immediate:true});
onBeforeUnmount(()=>{if(opener||props.open)release()});
</script>
<template><div v-if="open" class="acme-modal" role="presentation" @mousedown.self="emit('close')"><section ref="panel" class="acme-modal__panel" role="dialog" aria-modal="true" :aria-labelledby="id" tabindex="-1"><div class="acme-cluster" style="justify-content:space-between"><h2 :id="id">{{title}}</h2><button type="button" class="acme-button acme-button--ghost" aria-label="關閉" @click="emit('close')">×</button></div><slot/></section></div></template>
