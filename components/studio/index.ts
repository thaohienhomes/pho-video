/**
 * Studio Components - Pixel Perfect Implementations
 * 
 * All components use design tokens from app/design-tokens.css
 * Refer to component-specs.md for exact specifications
 */

// ===== Phase 1: Core Controls =====
export { ModelCard, ModelCardGrid } from './ModelCard'
export { GenerateButton, GenerateButtonCompact } from './GenerateButton'
export { AspectRatioSelector, AspectRatioSelectorCompact } from './AspectRatioSelector'

// ===== Phase 1: Layout Components =====
export { StoryboardDock } from './StoryboardDock'
export { GlassPanel, GlassCard, GlassDivider } from './GlassPanel'

// ===== Phase 2: Secondary Studio Components =====
export { StudioHeader } from './StudioHeader'
export { UploadZone } from './UploadZone'
export { StylePresetGrid, ActionButton } from './StylePresetGrid'
export { ResultDisplay } from './ResultDisplay'

// ===== Phase 3: Main Stage Components =====
export { VideoPlayerContainer, VideoControls } from './VideoPlayerContainer'
export { ComparisonSlider } from './ComparisonSlider'
export { ActionButtonsRow, createDownloadAction, createShareAction, createRemixAction, createDeleteAction } from './ActionButtonsRow'

// ===== Phase 5: Layout Components =====
export { StudioLayout, StudioSidebarSection, StudioMainStage } from './StudioLayout'
export { VideoStage } from './VideoStage'
export { ColorfulThumbnailDock } from './ThumbnailDock'
export { ImageStage } from './ImageStage'

// ===== Phase 6: Pixel-Perfect Polish =====
export { PixelPerfectModeSelector } from './MockupModeSelector'
export { CompactModelGrid } from './MockupModelGrid'
export { VideoInputTabs } from './VideoInputTabs'
export { CleanPromptInput } from './CleanPromptInput'
export { MockupSidebar } from './MockupSidebar'
export { HistorySidebar } from './HistorySidebar'
