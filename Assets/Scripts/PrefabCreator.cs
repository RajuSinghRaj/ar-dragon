using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

/// <summary>
/// AR Tracked Image Spawner for AR Dragon Game.
/// Detects real-world reference images and instantiates the 3D Dragon model.
/// </summary>
[RequireComponent(typeof(ARTrackedImageManager))]
public class PrefabCreator : MonoBehaviour
{
    [Header("Dragon Prefab Reference")]
    [Tooltip("The 3D Dragon prefab to spawn on image detection")]
    [SerializeField] private GameObject dragonPrefab;

    [Header("Spawn Settings")]
    [Tooltip("Vertical height offset above the detected image")]
    [SerializeField] private Vector3 spawnOffset = new Vector3(0, 0.05f, 0);

    private ARTrackedImageManager trackedImageManager;
    private readonly Dictionary<string, GameObject> spawnedDragons = new Dictionary<string, GameObject>();

    private void Awake()
    {
        trackedImageManager = GetComponent<ARTrackedImageManager>();
    }

    private void OnEnable()
    {
        trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
    }

    private void OnDisable()
    {
        trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
    }

    private void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
    {
        foreach (ARTrackedImage trackedImage in eventArgs.added)
        {
            UpdateOrSpawnDragon(trackedImage);
        }

        foreach (ARTrackedImage trackedImage in eventArgs.updated)
        {
            if (trackedImage.trackingState == TrackingState.Tracking)
            {
                UpdateOrSpawnDragon(trackedImage);
            }
            else if (trackedImage.trackingState == TrackingState.Limited)
            {
                if (spawnedDragons.TryGetValue(trackedImage.referenceImage.name, out GameObject dragon))
                {
                    dragon.SetActive(false);
                }
            }
        }

        foreach (ARTrackedImage trackedImage in eventArgs.removed)
        {
            if (spawnedDragons.TryGetValue(trackedImage.referenceImage.name, out GameObject dragon))
            {
                Destroy(dragon);
                spawnedDragons.Remove(trackedImage.referenceImage.name);
            }
        }
    }

    private void UpdateOrSpawnDragon(ARTrackedImage trackedImage)
    {
        string imageName = trackedImage.referenceImage.name;
        Vector3 spawnPosition = trackedImage.transform.position + spawnOffset;
        Quaternion spawnRotation = trackedImage.transform.rotation;

        if (!spawnedDragons.ContainsKey(imageName))
        {
            GameObject newDragon = Instantiate(dragonPrefab, spawnPosition, spawnRotation);
            newDragon.name = $"Dragon_{imageName}";
            newDragon.transform.parent = trackedImage.transform;
            spawnedDragons[imageName] = newDragon;
            Debug.Log($"[AR Dragon] Successfully spawned Dragon over image: {imageName}");
        }
        else
        {
            GameObject existingDragon = spawnedDragons[imageName];
            existingDragon.transform.position = spawnPosition;
            existingDragon.transform.rotation = spawnRotation;
            existingDragon.SetActive(true);
        }
    }
}
