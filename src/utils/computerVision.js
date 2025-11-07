import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-webgl'

/**
 * MODEL: COCO-SSD (Common Objects in Context - Single Shot Detector)
 * - Pre-trained on COCO dataset with 90 object classes
 * - Can detect everyday objects like people, animals, furniture, food, etc.
 * - Returns: object class, confidence score (0-1), bounding box coordinates
 * - Speed: ~30-60ms per frame on modern devices
 * - Accuracy: 50-95% depending on object clarity and lighting
 */

let objectDetectionModel = null
let isModelLoading = false

// Load COCO-SSD object detection model
// Model size: ~5MB, loads in 2-5 seconds
export const loadObjectDetectionModel = async () => {
  if (objectDetectionModel) return objectDetectionModel
  if (isModelLoading) {
    // Wait for model to load
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return objectDetectionModel
  }

  try {
    isModelLoading = true
    // Load lite_mobilenet_v2 model for faster performance
    objectDetectionModel = await cocoSsd.load({
      base: 'lite_mobilenet_v2' // Faster, slightly less accurate than mobilenet_v2
    })
    isModelLoading = false
    console.log('COCO-SSD model loaded successfully')
    return objectDetectionModel
  } catch (error) {
    console.error('Error loading object detection model:', error)
    isModelLoading = false
    return null
  }
}

// Detect objects in video frame
export const detectObjects = async (videoElement) => {
  if (!objectDetectionModel) {
    await loadObjectDetectionModel()
  }
  if (!objectDetectionModel) return []

  try {
    const predictions = await objectDetectionModel.detect(videoElement)
    return predictions.map(pred => ({
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox
    }))
  } catch (error) {
    console.error('Error detecting objects:', error)
    return []
  }
}

// Simple emotion detection (simplified - uses basic face detection)
// For production, you would use a dedicated emotion detection model
export const detectEmotions = async (videoElement) => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Use face detection (e.g., blazeface)
  // 2. Extract facial features
  // 3. Classify emotions based on features
  // For now, we'll return null and let the component handle simulation
  return null
}

// Draw bounding boxes on canvas
export const drawDetections = (canvas, detections, video) => {
  if (!canvas || !detections) return
  
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  detections.forEach(detection => {
    const [x, y, width, height] = detection.bbox
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)
    
    ctx.fillStyle = '#00FF00'
    ctx.font = '20px Arial'
    ctx.fillText(
      `${detection.class} (${Math.round(detection.score * 100)}%)`,
      x,
      y > 20 ? y - 5 : y + 20
    )
  })
}

// Common objects for learning
export const LEARNING_OBJECTS = [
  'apple', 'banana', 'book', 'bottle', 'bowl', 'cup', 'fork', 'knife',
  'laptop', 'mouse', 'remote', 'scissors', 'spoon', 'tv', 'cell phone',
  'chair', 'couch', 'bed', 'table', 'toilet', 'sink', 'refrigerator'
]

// Check if detected object matches learning object
export const isLearningObject = (detectedClass) => {
  return LEARNING_OBJECTS.some(obj => 
    detectedClass.toLowerCase().includes(obj.toLowerCase()) ||
    obj.toLowerCase().includes(detectedClass.toLowerCase())
  )
}
