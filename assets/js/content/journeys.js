/*
 * Journeys content. "Take me from beginning to end."
 * A journey is not a guide. It is an ordered set of stages, and each stage
 * points to the concepts to learn and the guides to complete.
 *
 * Stage shape: { title, html, learn: [concept slugs], do: [guide slugs], checklist?: [] }
 */
(function () {
  const { tip, note } = FX.h;

  FX.content.journey = {
    categories: [
      { id: 'all', title: 'All journeys', items: ['roll-out-sso', 'automate-onboarding-offboarding', 'strengthen-authentication-mfa', 'deploy-device-management', 'connect-workforce-identity-source', 'application-access-governance'] },
    ],
    pages: {
      'roll-out-sso': {
        title: 'Roll out SSO across your organization',
        summary: 'Move from separate application passwords to one Fixiam sign-in for every employee, from planning through to monitoring.',
        updated: '2026-09-30',
        audience: 'IT administrators and identity teams',
        effort: 'Medium',
        duration: '2 to 6 weeks',
        keywords: ['sso', 'single sign on', 'rollout', 'deploy sso', 'migration', 'saml', 'oidc'],
        outcome: ['Every priority application uses Fixiam for sign-in', 'Employees use one password and MFA everywhere', 'Sign-in activity is monitored in one place'],
        stages: [
          { title: 'Plan your SSO rollout', html: `<p>List the applications your organization uses, who uses them and which SSO standard each one supports. Rank them by risk and number of users, and pick two or three for a pilot.</p>${tip('Start with an application that has many users and good SAML support, such as Microsoft 365 or Slack. An early win builds confidence.')}`, learn: ['single-sign-on', 'iam'], do: [], checklist: ['Application inventory with owners', 'Pilot applications chosen', 'Pilot user group identified', 'Communication plan drafted'] },
          { title: 'Connect your identity source', html: `<p>SSO is only as good as the identities behind it. Connect the system that already knows who your employees are, so the right people exist in Fixiam before they sign in.</p>`, learn: ['identity-sources', 'identity-lifecycle'], do: ['connect-active-directory', 'connect-hr-source', 'import-users-from-google'], checklist: ['Identity source connected', 'Users imported and reviewed'] },
          { title: 'Add your application', html: `<p>Add each pilot application from the Fixiam catalog. Catalog integrations come with recommended settings, which saves time and reduces mistakes.</p>`, learn: [], do: ['add-application'], checklist: ['Pilot applications added'] },
          { title: 'Configure SSO', html: `<p>Set up the trust between Fixiam and each application using SAML or OpenID Connect, whichever the application supports.</p>`, learn: ['saml', 'openid-connect'], do: ['configure-saml-sso', 'configure-oidc-sso'], checklist: ['SSO configured for each pilot application', 'Attribute mappings reviewed'] },
          { title: 'Assign users', html: `<p>Assign the pilot group to each application. Use groups rather than individuals so access stays correct as people join and leave.</p>`, learn: ['roles-and-permissions', 'authn-vs-authz'], do: ['assign-users-to-application', 'configure-application-roles'], checklist: ['Pilot group assigned', 'Application roles mapped'] },
          { title: 'Configure authentication requirements', html: `<p>Now that every sign-in goes through Fixiam, decide how strong it should be. Require MFA for the pilot group and consider stronger factors for sensitive applications.</p>`, learn: ['multi-factor-authentication', 'adaptive-authentication'], do: ['configure-mfa'], checklist: ['MFA policy applied to pilot group'] },
          { title: 'Test the integration', html: `<p>Test sign-in for each application from a private browser window, from both the Fixiam dashboard and the application’s own sign-in page. Test with a regular user, not only an administrator.</p>${note('Keep a local administrator account in each application until testing is complete, so you can recover if SSO is misconfigured.')}`, learn: [], do: ['configure-saml-sso'], checklist: ['IdP-initiated sign-in works', 'SP-initiated sign-in works', 'Attributes arrive correctly'] },
          { title: 'Roll out to users', html: `<p>Expand assignments from the pilot group to wider groups in waves. Tell people what will change and when, and where to get help.</p>`, learn: [], do: ['assign-users-to-application'], checklist: ['Wave 1 complete', 'Wave 2 complete', 'Direct sign-in disabled in each application'] },
          { title: 'Monitor authentication', html: `<p>Watch sign-in success rates for each application in the first weeks. A spike in failures usually points to a mapping issue or users bypassing SSO.</p>`, learn: ['single-sign-on'], do: ['monitor-sign-in-activity', 'view-audit-log'], checklist: ['Sign-in dashboard reviewed weekly'] },
        ],
        next: ['strengthen-authentication-mfa', 'application-access-governance'],
      },
      'automate-onboarding-offboarding': {
        title: 'Automate employee onboarding and offboarding',
        summary: 'Connect HR to Fixiam so joiners get access on day one and leavers lose it on their last day, without tickets.',
        updated: '2026-09-27',
        audience: 'IT, HR operations and security teams',
        effort: 'Medium',
        duration: '2 to 4 weeks',
        keywords: ['onboarding', 'offboarding', 'jml', 'lifecycle', 'hr', 'automation', 'provisioning'],
        outcome: ['New hires are created automatically from HR', 'Leavers are deactivated on time', 'Access follows people as they move'],
        stages: [
          { title: 'Understand the lifecycle', html: `<p>Agree with HR what each event means and when it should take effect.</p>`, learn: ['joiner-mover-leaver', 'identity-lifecycle'], do: [] },
          { title: 'Connect your HR source', html: `<p>Connect the HR system that records hires and terminations.</p>`, learn: ['identity-sources'], do: ['connect-hr-source', 'configure-sagehr', 'configure-seamlesshr'] },
          { title: 'Define birthright access', html: `<p>Decide which applications every employee, and every department, should get automatically.</p>`, learn: ['roles-and-permissions'], do: ['assign-users-to-application'] },
          { title: 'Provision applications', html: `<p>Use SCIM so accounts in applications are created and removed with the identity.</p>`, learn: ['scim'], do: ['configure-inbound-scim'] },
          { title: 'Test leaver processing', html: `<p>Run a test termination and confirm the user is deactivated everywhere.</p>`, learn: [], do: ['deactivate-user'] },
          { title: 'Go live and monitor', html: `<p>Turn on the source and review the first weeks of lifecycle events.</p>`, learn: [], do: ['view-audit-log'] },
        ],
        next: ['application-access-governance'],
      },
      'strengthen-authentication-mfa': {
        title: 'Strengthen authentication with MFA',
        summary: 'Introduce multi factor authentication for everyone, with phishing-resistant factors for the people and apps that need them most.',
        updated: '2026-09-29',
        audience: 'Security and IT administrators',
        effort: 'Low',
        duration: '1 to 3 weeks',
        keywords: ['mfa', 'multi factor', 'authentication', 'security', 'biometric'],
        outcome: ['Every user enrolled in at least one authenticator', 'MFA required by policy', 'Stronger factors for administrators'],
        stages: [
          { title: 'Learn the factor types', html: `<p>Understand the difference between factors and which ones resist phishing.</p>`, learn: ['multi-factor-authentication'], do: [] },
          { title: 'Enable authenticators', html: `<p>Turn on at least two methods so users have a fallback.</p>`, learn: [], do: ['set-up-totp', 'set-up-portrait-authentication', 'set-up-fingerprint-authentication'] },
          { title: 'Pilot an MFA policy', html: `<p>Apply MFA to a pilot group with an enrollment grace period.</p>`, learn: ['adaptive-authentication'], do: ['configure-mfa'] },
          { title: 'Roll out and monitor enrollment', html: `<p>Expand the policy and track enrollment until everyone is covered.</p>`, learn: [], do: ['monitor-sign-in-activity'] },
        ],
        next: ['deploy-device-management'],
      },
      'deploy-device-management': {
        title: 'Deploy Fixiam Device Management',
        summary: 'Enroll company devices, define compliance rules and require trusted devices for sensitive applications.',
        updated: '2026-10-01',
        audience: 'Endpoint and IT administrators',
        effort: 'High',
        duration: '3 to 8 weeks',
        keywords: ['device', 'device management', 'enroll', 'compliance', 'windows', 'macos'],
        outcome: ['Company devices enrolled', 'Compliance measured against policy', 'Device trust used in sign-in'],
        stages: [
          { title: 'Understand device trust', html: `<p>Learn how device posture becomes a sign-in signal.</p>`, learn: ['device-management', 'adaptive-authentication'], do: [] },
          { title: 'Create device policies', html: `<p>Define what compliant means for each platform.</p>`, learn: [], do: ['create-device-policy'] },
          { title: 'Enroll devices', html: `<p>Enroll a pilot set of Windows and macOS devices, then the rest.</p>`, learn: [], do: ['enroll-windows-device', 'enroll-macos-device'] },
          { title: 'Review compliance', html: `<p>Find and fix non-compliant devices before enforcing.</p>`, learn: [], do: ['check-device-compliance'] },
          { title: 'Require trusted devices', html: `<p>Add a device requirement to sign-in policies for sensitive applications.</p>`, learn: [], do: ['configure-mfa'] },
        ],
        next: ['strengthen-authentication-mfa'],
      },
      'connect-workforce-identity-source': {
        title: 'Connect your workforce identity source',
        summary: 'Bring your people into Fixiam from Active Directory, Google Workspace or HR, and keep them in sync.',
        updated: '2026-09-24',
        audience: 'IT administrators',
        effort: 'Low',
        duration: '1 to 2 weeks',
        keywords: ['identity source', 'active directory', 'google', 'hr', 'directory', 'import'],
        outcome: ['A single, accurate directory in Fixiam', 'Ongoing sync from the source of truth'],
        stages: [
          { title: 'Choose your source of truth', html: `<p>Decide which system owns which attributes.</p>`, learn: ['identity-sources'], do: [] },
          { title: 'Connect the source', html: `<p>Connect a directory or HR system.</p>`, learn: [], do: ['connect-active-directory', 'connect-google-workspace', 'connect-hr-source'] },
          { title: 'Import and review users', html: `<p>Run an import and check for duplicates.</p>`, learn: [], do: ['import-users-from-active-directory', 'import-users-from-google', 'bulk-import-users'] },
          { title: 'Schedule ongoing sync', html: `<p>Set a sync schedule and alerting.</p>`, learn: ['identity-lifecycle'], do: [] },
        ],
        next: ['roll-out-sso', 'automate-onboarding-offboarding'],
      },
      'application-access-governance': {
        title: 'Implement application access governance',
        summary: 'Give people a clear way to request access, route approvals, and prove access is appropriate.',
        updated: '2026-09-22',
        audience: 'Security, compliance and application owners',
        effort: 'Medium',
        duration: '2 to 5 weeks',
        keywords: ['governance', 'access request', 'approval', 'audit', 'compliance'],
        outcome: ['A self-service access catalog', 'Consistent approvals with an audit trail', 'Time-bound access for sensitive roles'],
        stages: [
          { title: 'Learn the governance model', html: `<p>Understand birthright access, requests and approvals.</p>`, learn: ['access-requests', 'roles-and-permissions', 'privileged-access-management'], do: [] },
          { title: 'Design approval chains', html: `<p>Agree approvers with application owners.</p>`, learn: [], do: ['configure-approval-levels'] },
          { title: 'Publish requestable items', html: `<p>Add applications and roles to the access catalog.</p>`, learn: [], do: ['create-access-request', 'configure-application-roles'] },
          { title: 'Train approvers', html: `<p>Show approvers how to review requests.</p>`, learn: [], do: ['review-and-approve-requests'] },
          { title: 'Audit and report', html: `<p>Export access reports for compliance reviews.</p>`, learn: [], do: ['view-audit-log', 'export-reports'] },
        ],
        next: ['automate-onboarding-offboarding'],
      },
    },
  };
})();
