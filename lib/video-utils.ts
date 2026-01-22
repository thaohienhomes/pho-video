/**
 * Video Utilities for Frame Extraction
 * 
 * Client-side utilities for working with video files,
 * particularly for extracting frames for I2V workflows.
 */

/**
 * Extract the last frame of a video as a Base64 encoded string.
 * Uses a hidden video element to load and seek, then canvas to capture.
 * 
 * @param videoUrl - URL of the video to extract from
 * @returns Promise<string> - Base64 encoded image (data:image/png;base64,...)
 */
export async function getLastFrameAsBase64(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create hidden video element
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous' // Enable CORS for external videos
        video.muted = true
        video.playsInline = true

        // Handle video load errors
        video.onerror = (e) => {
            console.error('[VideoUtils] Failed to load video. This usually happens due to CORS or the URL expiring.', e)
            video.src = ''
            reject(new Error('Failed to load video. Please ensure the source video is still available and supports cross-origin requests.'))
        }

        // When video metadata is loaded, we know the duration
        video.onloadedmetadata = () => {
            console.log(`[VideoUtils] Video loaded. Duration: ${video.duration}s`)

            // Seek to near the end (last 0.1 seconds to get final frame)
            const seekTime = Math.max(0, video.duration - 0.1)
            video.currentTime = seekTime
        }

        // When seek completes, capture the frame
        video.onseeked = () => {
            try {
                console.log(`[VideoUtils] Seeked to ${video.currentTime}s, capturing frame...`)

                // Create canvas matching video dimensions
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight

                // Draw the current frame
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                // Convert to Base64 PNG
                const base64 = canvas.toDataURL('image/png')
                console.log(`[VideoUtils] Frame captured! Size: ${base64.length} chars`)

                // Cleanup
                video.src = ''
                video.load()

                resolve(base64)
            } catch (error) {
                console.error('[VideoUtils] Error capturing frame:', error)
                reject(error)
            }
        }

        // Start loading the video
        video.src = videoUrl
        video.load()
    })
}

/**
 * Extract a frame at a specific time position.
 * 
 * @param videoUrl - URL of the video
 * @param timeSeconds - Time in seconds to extract frame from
 * @returns Promise<string> - Base64 encoded image
 */
export async function getFrameAtTimeAsBase64(
    videoUrl: string,
    timeSeconds: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.playsInline = true

        video.onerror = (e) => {
            console.error('[VideoUtils] Failed to load video at time:', e)
            video.src = ''
            reject(new Error('Failed to load video'))
        }

        video.onloadedmetadata = () => {
            // Clamp time to valid range
            const seekTime = Math.min(Math.max(0, timeSeconds), video.duration)
            video.currentTime = seekTime
        }

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const base64 = canvas.toDataURL('image/png')

                video.src = ''
                video.load()

                resolve(base64)
            } catch (error) {
                reject(error)
            }
        }

        video.src = videoUrl
        video.load()
    })
}

/**
 * Strip the data URL prefix from a Base64 string.
 * Useful when APIs expect raw base64 without the prefix.
 * 
 * @param dataUrl - Full data URL (data:image/png;base64,...)
 * @returns string - Raw base64 string without prefix
 */
export function stripBase64Prefix(dataUrl: string): string {
    const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/)
    return match ? match[1] : dataUrl
}
