using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Fixed Joystick Controller for AR Mobile Game.
/// Compatible with Unity Joystick Pack and mobile touch/drag input.
/// </summary>
public class FixedJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
{
    [SerializeField] private float handleRange = 1f;
    [SerializeField] private float deadZone = 0f;
    [SerializeField] protected RectTransform background = null;
    [SerializeField] private RectTransform handle = null;

    private Canvas canvas;
    private Camera cam;
    private Vector2 input = Vector2.zero;

    public float Horizontal => input.x;
    public float Vertical => input.y;
    public Vector2 Direction => new Vector2(Horizontal, Vertical);

    protected virtual void Start()
    {
        canvas = GetComponentInParent<Canvas>();
        if (canvas == null)
            Debug.LogError("[Joystick] No Canvas found in parents!");

        Vector2 center = new Vector2(0.5f, 0.5f);
        background.pivot = center;
        handle.anchorMin = center;
        handle.anchorMax = center;
        handle.pivot = center;
        handle.anchoredPosition = Vector2.zero;
    }

    public virtual void OnPointerDown(PointerEventData eventData)
    {
        OnDrag(eventData);
    }

    public void OnDrag(PointerEventData eventData)
    {
        cam = null;
        if (canvas.renderMode == RenderMode.ScreenSpaceCamera)
            cam = canvas.worldCamera;

        Vector2 position = RectTransformUtility.WorldToScreenPoint(cam, background.position);
        Vector2 radius = background.sizeDelta / 2;
        input = (eventData.position - position) / (radius * canvas.scaleFactor);

        FormatInput();
        HandleInput(input.magnitude, input.normalized, radius, cam);
        handle.anchoredPosition = input * radius * handleRange;
    }

    private void FormatInput()
    {
        if (input.magnitude > 1f)
            input = input.normalized;
    }

    private void HandleInput(float magnitude, Vector2 normalised, Vector2 radius, Camera cam)
    {
        if (magnitude > deadZone)
        {
            if (magnitude > 1)
                input = normalised;
        }
        else
            input = Vector2.zero;
    }

    public virtual void OnPointerUp(PointerEventData eventData)
    {
        input = Vector2.zero;
        handle.anchoredPosition = Vector2.zero;
    }
}
