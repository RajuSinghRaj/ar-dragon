using UnityEngine;

/// <summary>
/// Dragon Controller for AR Dragon Game.
/// Handles virtual joystick input, Rigidbody physics, speed, and smooth rotation.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
public class DragonController : MonoBehaviour
{
    [Header("Input References")]
    [Tooltip("Reference to the virtual fixed joystick in the UI")]
    [SerializeField] private FixedJoystick joystick;

    [Header("Movement Settings")]
    [Tooltip("Movement speed of the dragon")]
    [SerializeField] private float moveSpeed = 1.5f;

    [Tooltip("Rotation speed toward movement direction")]
    [SerializeField] private float rotationSpeed = 12f;

    [Header("Animation Settings")]
    [SerializeField] private Animator animator;
    [SerializeField] private string walkParamName = "isWalking";

    private Rigidbody rb;
    private Vector3 moveDirection;

    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.useGravity = false;
        rb.freezeRotation = true;

        if (joystick == null)
            joystick = FindObjectOfType<FixedJoystick>();

        if (animator == null)
            animator = GetComponentInChildren<Animator>();
    }

    private void Update()
    {
        if (joystick == null) return;

        float horizontal = joystick.Horizontal;
        float vertical = joystick.Vertical;

        moveDirection = new Vector3(horizontal, 0f, vertical).normalized;

        if (animator != null && !string.IsNullOrEmpty(walkParamName))
        {
            bool isMoving = moveDirection.sqrMagnitude > 0.01f;
            animator.SetBool(walkParamName, isMoving);
        }
    }

    private void FixedUpdate()
    {
        if (moveDirection.sqrMagnitude > 0.001f)
        {
            Vector3 targetVelocity = moveDirection * moveSpeed;
            rb.velocity = new Vector3(targetVelocity.x, rb.velocity.y, targetVelocity.z);

            Quaternion targetRotation = Quaternion.LookRotation(moveDirection, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);
        }
        else
        {
            rb.velocity = new Vector3(0, rb.velocity.y, 0);
        }
    }
}
