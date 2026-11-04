using System.Collections;
using UnityEngine;

/// <summary>
/// Dragon Fire Attack Controller for AR Dragon Game.
/// Handles the Fire Breath particle system, roar audio effects, and combat damage.
/// </summary>
public class DragonFireAttack : MonoBehaviour
{
    [Header("Fire Breath VFX")]
    [Tooltip("Particle system attached to dragon's mouth")]
    [SerializeField] private ParticleSystem fireBreathParticles;

    [Header("Audio SFX")]
    [Tooltip("AudioSource component for playing sounds")]
    [SerializeField] private AudioSource audioSource;
    [Tooltip("Dragon roar sound clip")]
    [SerializeField] private AudioClip roarClip;
    [Tooltip("Fire stream blast sound clip")]
    [SerializeField] private AudioClip fireBlastClip;

    [Header("Combat Settings")]
    [Tooltip("Duration of the fire attack in seconds")]
    [SerializeField] private float attackDuration = 2.5f;
    [Tooltip("Fire attack damage value")]
    [SerializeField] private int attackDamage = 850;
    [Tooltip("Fire breath damage radius")]
    [SerializeField] private float damageRadius = 2.0f;

    [Header("Animation")]
    [SerializeField] private Animator animator;
    [SerializeField] private string attackTriggerName = "FireAttack";

    private bool isAttacking = false;

    private void Awake()
    {
        if (audioSource == null)
            audioSource = GetComponent<AudioSource>();

        if (animator == null)
            animator = GetComponentInChildren<Animator>();

        if (fireBreathParticles != null)
            fireBreathParticles.Stop();
    }

    /// <summary>
    /// Triggered by the UI 'FIRE ATTACK' button or gameplay event
    /// </summary>
    public void TriggerFireAttack()
    {
        if (isAttacking) return;
        StartCoroutine(FireAttackSequence());
    }

    private IEnumerator FireAttackSequence()
    {
        isAttacking = true;
        Debug.Log("[AR Dragon] INFERNO breathes Hellfire!");

        // 1. Trigger Animation
        if (animator != null && !string.IsNullOrEmpty(attackTriggerName))
        {
            animator.SetTrigger(attackTriggerName);
        }

        // 2. Play Roar Sound
        if (audioSource != null && roarClip != null)
        {
            audioSource.PlayOneShot(roarClip, 1.0f);
        }

        yield return new WaitForSeconds(0.3f);

        // 3. Activate Fire Breath Particle Stream
        if (fireBreathParticles != null)
        {
            fireBreathParticles.Play();
        }

        // 4. Play Fire Loop Sound
        if (audioSource != null && fireBlastClip != null)
        {
            audioSource.PlayOneShot(fireBlastClip, 0.8f);
        }

        // 5. Apply Damage to Targets in Range
        ApplyFireDamage();

        yield return new WaitForSeconds(attackDuration);

        // 6. Stop Fire Particle Stream
        if (fireBreathParticles != null)
        {
            fireBreathParticles.Stop();
        }

        isAttacking = false;
    }

    private void ApplyFireDamage()
    {
        Vector3 fireOrigin = transform.position + transform.forward * 0.8f;
        Collider[] hitColliders = Physics.OverlapSphere(fireOrigin, damageRadius);

        foreach (Collider hit in hitColliders)
        {
            if (hit.gameObject != gameObject)
            {
                Debug.Log($"[AR Dragon] Fire hit: {hit.name} for {attackDamage} Damage!");
            }
        }
    }

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Vector3 fireOrigin = transform.position + transform.forward * 0.8f;
        Gizmos.DrawWireSphere(fireOrigin, damageRadius);
    }
}
