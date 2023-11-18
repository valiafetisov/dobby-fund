<script setup lang="ts">
import { NCollapseItem, NIcon, NButton } from 'naive-ui'
import { ref, watch } from 'vue'
import { Print as PrintIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'

const props = defineProps<{
  archivedPartsCount: string
  archivedPartsThreshold: string
  accountGenerationDate: string
  accountBalances: { chain: string; balance: number; lockedAt: string | undefined }[]
}>()

const downloadedAt = ref<number | null>(null)
const isGenerating = ref(false)

const generatePdf = async () => {
  isGenerating.value = true
  await new Promise(() => {
    setTimeout(() => {
      isGenerating.value = false
      downloadedAt.value = new Date().getTime()
    }, 3000)
  })
}

watch(
  () => [props.archivedPartsCount, props.archivedPartsThreshold],
  ([newArchivedPartsCount, oldArchivedPartsCount], [newArchivedPartsThreshold, oldArchivedPartsThreshold]) => {
    if (newArchivedPartsCount !== oldArchivedPartsCount || newArchivedPartsThreshold !== oldArchivedPartsThreshold) {
      downloadedAt.value = null
    }
  }
)
</script>
<template>
  <n-collapse-item name="1">
    <template #header>
      <n-icon><print-icon /></n-icon>
      <h4 class="ml-2 font-semibold">Print certificate</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus nec ullamcorper eros, sed tincidunt erat. Proin congue leo eget
        lacinia suscipit. Duis felis lorem, molestie non nulla at, eleifend tristique justo. Nulla vitae libero eget est consectetur mattis
        nec at nisi. Pellentesque hendrerit elementum ultricies. Nunc ac scelerisque nunc. Maecenas mattis blandit ante, vel tristique ipsum
        semper vitae. Etiam at tincidunt est. Nullam ut enim pretium, pellentesque sapien ac, scelerisque nunc.
      </div>
      <div class="flex gap-2 items-center">
        <n-button :type="downloadedAt ? 'default' : 'primary'" :loading="isGenerating" @click="generatePdf()">
          Download account certificate
        </n-button>
        <div v-if="downloadedAt" class="text-gray-400 flex items-center">Downloaded at {{ format(downloadedAt, 'HH:mm dd.MM.yyyy') }}</div>
      </div>
    </div>
  </n-collapse-item>
</template>
