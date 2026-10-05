/*
 * Concepts content. "Teach me."
 * A concept page explains an idea. It does not walk through configuration;
 * instead it links out to the guides that do.
 *
 * Page shape:
 *   { title, summary, updated, keywords[], sections[{id,title,html}], terms[{term,def}],
 *     related: { concepts[], guides[] } }
 */
(function () {
  const { note, tip, important, table, code, icons } = FX.h;

  const ssoDiagram = `
<figure class="diagram" data-c="Diagram">
  <div class="diagram-scroll">
  <svg viewBox="0 0 720 420" role="img" aria-labelledby="sso-dg-t sso-dg-d" class="dg">
    <title id="sso-dg-t">Single Sign On authentication flow</title>
    <desc id="sso-dg-d">The user opens an application, the application redirects to Fixiam, Fixiam verifies the user, returns a signed assertion, and the application grants access.</desc>
    <defs>
      <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="dg-head"/></marker>
      <marker id="ah-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="dg-head-accent"/></marker>
    </defs>
    <rect x="30" y="16" width="160" height="48" rx="8" class="dg-lane"/>
    <text x="110" y="45" class="dg-lane-t">User and browser</text>
    <rect x="280" y="16" width="160" height="48" rx="8" class="dg-lane"/>
    <text x="360" y="37" class="dg-lane-t">Application</text>
    <text x="360" y="54" class="dg-lane-s">Service provider</text>
    <rect x="530" y="16" width="160" height="48" rx="8" class="dg-lane accent"/>
    <text x="610" y="37" class="dg-lane-t accent">Fixiam</text>
    <text x="610" y="54" class="dg-lane-s accent">Identity provider</text>
    <line x1="110" y1="64" x2="110" y2="380" class="dg-life"/>
    <line x1="360" y1="64" x2="360" y2="380" class="dg-life"/>
    <line x1="610" y1="64" x2="610" y2="380" class="dg-life"/>

    <line x1="114" y1="105" x2="354" y2="105" class="dg-arrow" marker-end="url(#ah)"/>
    <text x="235" y="96" class="dg-label">1. Opens the application</text>

    <line x1="364" y1="150" x2="604" y2="150" class="dg-arrow" marker-end="url(#ah)"/>
    <text x="485" y="141" class="dg-label">2. Redirects with a sign-in request</text>

    <rect x="520" y="178" width="180" height="62" rx="8" class="dg-box"/>
    <text x="610" y="204" class="dg-box-t">3. Verifies identity</text>
    <text x="610" y="224" class="dg-box-s">Password · MFA · Policy</text>

    <line x1="604" y1="280" x2="364" y2="280" class="dg-arrow accent" marker-end="url(#ah-a)"/>
    <text x="485" y="271" class="dg-label">4. Returns a signed assertion</text>

    <line x1="354" y1="330" x2="114" y2="330" class="dg-arrow" marker-end="url(#ah)"/>
    <text x="235" y="321" class="dg-label">5. Grants access</text>

    <text x="360" y="406" class="dg-foot">If the user already has a Fixiam session, step 3 is skipped and access is immediate.</text>
  </svg>
  </div>
  <figcaption>Figure 1. A service provider initiated SSO flow. The application never sees the user's password.</figcaption>
</figure>`;

  const fitDiagram = `
<figure class="fit" data-c="Diagram">
  <div class="fit-grid">
    <div class="fit-col">
      <div class="fit-h">Identity sources</div>
      <span>Active Directory</span><span>Google Workspace</span><span>SageHR</span><span>SeamlessHR</span>
    </div>
    <div class="fit-arrow" aria-hidden="true">${icons.arrowRight}</div>
    <div class="fit-core">
      <div class="fit-h">Fixiam</div>
      <span>Directory</span><span>Authentication policies</span><span>Application assignments</span><span>Audit log</span>
    </div>
    <div class="fit-arrow" aria-hidden="true">${icons.arrowRight}</div>
    <div class="fit-col">
      <div class="fit-h">Applications</div>
      <span>Microsoft 365</span><span>Salesforce</span><span>Slack</span><span>Internal apps</span>
    </div>
  </div>
  <figcaption>Figure 2. Fixiam sits between where identities come from and the applications people use.</figcaption>
</figure>`;

  const jmlDiagram = `
<figure class="jml" data-c="Diagram">
  <div class="jml-grid">
    <div class="jml-step"><span class="jml-k">Joiner</span><strong>A new hire is created in HR</strong><span>Fixiam creates the account, assigns birthright applications and sends an activation email.</span></div>
    <div class="jml-arrow" aria-hidden="true">${icons.arrowRight}</div>
    <div class="jml-step"><span class="jml-k">Mover</span><strong>Department or role changes</strong><span>Group rules recalculate. New access is granted and access the role no longer needs is removed.</span></div>
    <div class="jml-arrow" aria-hidden="true">${icons.arrowRight}</div>
    <div class="jml-step"><span class="jml-k">Leaver</span><strong>Employment ends</strong><span>Fixiam suspends sign-in, revokes sessions, deprovisions apps and keeps an audit record.</span></div>
  </div>
  <figcaption>Figure 1. Each lifecycle event is triggered by a change in the identity source.</figcaption>
</figure>`;

  FX.content = FX.content || {};
  FX.content.concept = {
    categories: [
      { id: 'foundations', title: 'Foundations', desc: 'The core ideas behind identity and access management.', items: ['iam', 'authn-vs-authz', 'roles-and-permissions'] },
      { id: 'authentication', title: 'Authentication', desc: 'How people prove who they are when they sign in.', items: ['single-sign-on', 'multi-factor-authentication', 'adaptive-authentication'] },
      { id: 'standards', title: 'Standards and protocols', desc: 'The open standards Fixiam uses to talk to applications.', items: ['saml', 'openid-connect', 'scim'] },
      { id: 'lifecycle', title: 'Identity lifecycle', desc: 'How identities are created, changed and removed over time.', items: ['identity-lifecycle', 'joiner-mover-leaver', 'identity-sources'] },
      { id: 'devices-access', title: 'Devices and access', desc: 'Trusted devices, access governance and privileged access.', items: ['device-management', 'access-requests', 'privileged-access-management'] },
    ],
    pages: {
      iam: {
        title: 'Identity and Access Management',
        summary: 'What identity and access management is, the problems it solves and the building blocks that make up an IAM platform like Fixiam.',
        updated: '2026-09-18',
        keywords: ['iam', 'identity', 'access', 'overview', 'platform'],
        sections: [
          { id: 'what-is-iam', title: 'What is IAM?', html: `<p>Identity and Access Management (IAM) is the set of processes and technology an organization uses to make sure the right people have the right access to the right resources, at the right time, and for the right reasons.</p><p>An IAM platform answers three questions for every request: <strong>who is this?</strong>, <strong>what are they allowed to do?</strong> and <strong>should we let them do it right now?</strong></p>` },
          { id: 'building-blocks', title: 'The building blocks', html: `${table(['Building block', 'What it does', 'In Fixiam'], [
            ['Directory', 'Stores identities and their attributes.', 'Users, groups and profile attributes'],
            ['Authentication', 'Verifies that a person is who they claim to be.', 'Sign-in policies, MFA, biometrics'],
            ['Authorization', 'Decides what an authenticated person can access.', 'Application assignments and roles'],
            ['Lifecycle', 'Creates, updates and removes access as people change.', 'HR sources, SCIM, group rules'],
            ['Governance', 'Proves access is appropriate and reviewed.', 'Access requests, approvals, audit log'],
          ])}` },
          { id: 'why-it-matters', title: 'Why it matters', html: `<p>Without a central IAM platform, every application keeps its own list of users and passwords. Access drifts as people change roles, former employees keep accounts, and nobody can say with confidence who can reach sensitive data.</p><p>Centralizing identity gives security teams one place to apply policy and gives employees one sign-in for everything they use.</p>` },
        ],
        terms: [
          { term: 'Identity', def: 'The digital representation of a person, service or device, made up of a unique identifier and attributes.' },
          { term: 'Principal', def: 'Any entity that can be authenticated, such as a user, service account or device.' },
          { term: 'Least privilege', def: 'Giving each identity only the access it needs to do its job, and no more.' },
        ],
        related: { concepts: ['authn-vs-authz', 'single-sign-on', 'identity-lifecycle'], guides: ['create-organization', 'add-user'] },
      },

      'authn-vs-authz': {
        title: 'Authentication vs Authorization',
        summary: 'Authentication confirms who someone is. Authorization decides what they can do. Learn how the two differ and how Fixiam handles each.',
        updated: '2026-09-02',
        keywords: ['authentication', 'authorization', 'authn', 'authz', 'difference', 'permissions'],
        sections: [
          { id: 'two-questions', title: 'Two different questions', html: `<p>People often use the words interchangeably, but they answer different questions and happen at different moments.</p>${table(['', 'Authentication', 'Authorization'], [
            ['Question', 'Who are you?', 'What are you allowed to do?'],
            ['Happens', 'At sign-in, before anything else', 'After sign-in, on every request'],
            ['Based on', 'Credentials: password, authenticator, biometrics', 'Policies, roles, group membership'],
            ['Visible to the user', 'Yes, as a sign-in prompt', 'Usually not, unless access is denied'],
            ['Standard', 'SAML, OpenID Connect', 'OAuth 2.0 scopes, application roles'],
          ])}` },
          { id: 'analogy', title: 'An everyday analogy', html: `<p>Think of an office building. Showing your ID badge at reception is <strong>authentication</strong>: the guard confirms you are an employee. Whether your badge then opens the server room door is <strong>authorization</strong>: the building checks what your badge is allowed to open.</p>` },
          { id: 'in-fixiam', title: 'How Fixiam handles each', html: `<p>Fixiam authenticates people using the sign-in policy that applies to them, which may include a password, an authenticator or a biometric factor. Once a person is signed in, Fixiam authorizes access by checking which applications they are assigned to and which <a href="#/concepts/roles-and-permissions">roles</a> they hold inside each application.</p>${note('A person can be fully authenticated and still be denied access to an application they are not assigned to. Fixiam logs both outcomes separately in the audit log.')}` },
        ],
        terms: [
          { term: 'Credential', def: 'Something a person presents to prove their identity, such as a password or a one-time code.' },
          { term: 'Scope', def: 'A named permission an application requests on behalf of a user, used in OAuth 2.0 and OpenID Connect.' },
        ],
        related: { concepts: ['iam', 'roles-and-permissions', 'multi-factor-authentication'], guides: ['assign-users-to-application', 'configure-application-roles'] },
      },

      'roles-and-permissions': {
        title: 'Roles and permissions',
        summary: 'How Fixiam uses roles to group permissions, both for administrators of Fixiam and for users inside connected applications.',
        updated: '2026-08-21',
        keywords: ['roles', 'permissions', 'rbac', 'admin roles', 'application roles'],
        sections: [
          { id: 'what-is-a-role', title: 'What is a role?', html: `<p>A permission is a single action, such as <em>approve expense reports</em>. A role is a named bundle of permissions, such as <em>Finance approver</em>. Assigning roles instead of individual permissions keeps access understandable as an organization grows.</p>` },
          { id: 'two-kinds', title: 'Two kinds of roles in Fixiam', html: `<ul><li><strong>Administrator roles</strong> control what someone can do inside the Fixiam Admin Console, for example Super administrator, Help desk administrator or Read-only auditor.</li><li><strong>Application roles</strong> are passed to connected applications during sign-in so the application can decide what the user sees, for example Viewer, Editor or Owner.</li></ul>${tip('Map application roles to Fixiam groups. When someone moves teams, their group membership changes and their application roles follow automatically.')}` },
        ],
        terms: [
          { term: 'RBAC', def: 'Role-based access control. Access is granted through roles rather than directly to individuals.' },
          { term: 'Birthright access', def: 'Access every member of a group receives automatically, such as email for all employees.' },
        ],
        related: { concepts: ['authn-vs-authz', 'access-requests'], guides: ['configure-application-roles', 'invite-administrators'] },
      },

      'single-sign-on': {
        title: 'Single Sign On',
        summary: 'Single Sign On (SSO) lets people sign in once with Fixiam and access all of their assigned applications without entering another password.',
        updated: '2026-09-28',
        keywords: ['sso', 'single sign on', 'single sign-on', 'federation', 'identity provider', 'idp', 'service provider'],
        sections: [
          { id: 'what-is-sso', title: 'What is Single Sign On?', html: `<p>Single Sign On (SSO) is an authentication method that lets a person use one set of credentials to access many applications. Instead of each application checking a password it stores itself, the application trusts a central <strong>identity provider</strong> to confirm who the person is.</p><p>With Fixiam as your identity provider, employees sign in once in the morning and move between Microsoft 365, Salesforce, Slack and internal tools without being asked to sign in again.</p>` },
          { id: 'why-sso', title: 'Why organizations use SSO', html: `<div class="benefits"><div><strong>Fewer passwords</strong><p>People remember one strong password instead of reusing weak ones across dozens of tools.</p></div><div><strong>Stronger security</strong><p>MFA and sign-in policies are enforced in one place and apply to every connected application.</p></div><div><strong>Faster offboarding</strong><p>Suspending a user in Fixiam removes access to every SSO application at once.</p></div><div><strong>Clear visibility</strong><p>Every sign-in to every application is recorded in a single audit log.</p></div></div>` },
          { id: 'how-sso-works', title: 'How SSO works', html: `<p>SSO relies on a trust relationship between two parties that is set up once by an administrator:</p><ul><li>The <strong>identity provider (IdP)</strong> authenticates the person. In this setup, that is Fixiam.</li><li>The <strong>service provider (SP)</strong> is the application the person wants to use.</li></ul><p>The two exchange certificates or client secrets when you configure the integration. After that, every sign-in follows the same pattern: the application sends the person to Fixiam, Fixiam verifies them, and Fixiam sends back a signed message that the application can trust.</p>${ssoDiagram}<p>The signed message is called an <strong>assertion</strong> in <a href="#/concepts/saml">SAML</a> and an <strong>ID token</strong> in <a href="#/concepts/openid-connect">OpenID Connect</a>. Either way, the application checks the signature, reads who the user is, and starts a session.</p>` },
          { id: 'where-fixiam-fits', title: 'Where Fixiam fits into the flow', html: `<p>Fixiam is the identity provider in every SSO flow. It also connects to the systems your identities come from, so the person who signs in is always the current, correct version of that employee.</p>${fitDiagram}<p>Because Fixiam is in the middle of every sign-in, it is also where you apply <a href="#/concepts/multi-factor-authentication">multi factor authentication</a>, <a href="#/concepts/adaptive-authentication">adaptive policies</a> and device checks.</p>` },
          { id: 'initiated', title: 'IdP-initiated and SP-initiated sign-in', html: `<p>A sign-in can start in either place:</p><ul><li><strong>SP-initiated</strong>: the person goes to the application first, as shown in Figure 1.</li><li><strong>IdP-initiated</strong>: the person starts in the Fixiam end user dashboard and selects an application tile.</li></ul>${note('Some applications only support one of these. The application page in the Fixiam catalog shows which ones are available.')}` },
        ],
        terms: [
          { term: 'Identity provider (IdP)', def: 'The system that authenticates users and vouches for their identity. Fixiam is your IdP.' },
          { term: 'Service provider (SP)', def: 'An application that relies on the identity provider to authenticate its users.' },
          { term: 'Assertion', def: 'A signed SAML message from the IdP that states who the user is and what attributes they have.' },
          { term: 'Federation', def: 'The trust relationship between an IdP and an SP that makes SSO possible.' },
          { term: 'Session', def: 'The period during which a user stays signed in without being asked for credentials again.' },
        ],
        related: { concepts: ['saml', 'openid-connect', 'multi-factor-authentication', 'authn-vs-authz'], guides: ['add-application', 'configure-saml-sso', 'configure-oidc-sso', 'assign-users-to-application'] },
      },

      'multi-factor-authentication': {
        title: 'Multi Factor Authentication',
        summary: 'Multi Factor Authentication (MFA) asks people to prove their identity with more than one type of evidence, so a stolen password alone is not enough.',
        updated: '2026-09-24',
        keywords: ['mfa', 'multi factor', '2fa', 'two factor', 'authenticator', 'totp', 'biometric', 'factors'],
        sections: [
          { id: 'what-is-mfa', title: 'What is MFA?', html: `<p>Multi Factor Authentication requires two or more independent pieces of evidence, called <strong>factors</strong>, before granting access. If one factor is compromised, for example a password in a phishing attack, the attacker still cannot sign in.</p>` },
          { id: 'factor-types', title: 'Types of factors', html: `<p>Factors are grouped by the kind of evidence they provide. A strong MFA policy combines factors from different groups.</p>${table(['Factor type', 'Description', 'Fixiam methods'], [
            ['Something you know', 'A secret only the user should know.', 'Password, PIN'],
            ['Something you have', 'A device in the user’s possession.', 'Fixiam Verify push, TOTP code, security key'],
            ['Something you are', 'A physical characteristic of the user.', 'Portrait authentication, fingerprint'],
          ])}${important('Two passwords are not multi factor. Both are something you know, so a single phishing page can capture both.')}` },
          { id: 'when-mfa', title: 'When Fixiam asks for MFA', html: `<p>You decide when MFA is required through <strong>authentication policies</strong>. Common choices are:</p><ul><li>Every sign-in to the Fixiam dashboard</li><li>Only when signing in from an unmanaged device or a new location</li><li>Every time someone opens a sensitive application, such as payroll</li></ul><p>Policies that adjust based on context are described in <a href="#/concepts/adaptive-authentication">Adaptive authentication</a>.</p>` },
          { id: 'choosing', title: 'Choosing the right factors', html: `<p>Phishing-resistant factors such as security keys and biometrics give the strongest protection. TOTP codes are widely compatible and work offline. Most organizations enable two or three methods so people always have a fallback.</p>${tip('Start with Fixiam Verify push and TOTP for everyone, then require biometrics for administrators and privileged applications.')}` },
        ],
        terms: [
          { term: 'Factor', def: 'A category of evidence used to verify identity.' },
          { term: 'TOTP', def: 'Time-based one-time password. A six-digit code that changes every 30 seconds.' },
          { term: 'Enrollment', def: 'The one-time process where a user registers an authenticator with Fixiam.' },
          { term: 'Step-up authentication', def: 'Asking for an additional factor in the middle of a session, before a sensitive action.' },
        ],
        related: { concepts: ['adaptive-authentication', 'single-sign-on', 'authn-vs-authz'], guides: ['configure-mfa', 'set-up-totp', 'set-up-portrait-authentication', 'set-up-fingerprint-authentication'] },
      },

      'adaptive-authentication': {
        title: 'Adaptive authentication',
        summary: 'Adaptive authentication adjusts what Fixiam asks for at sign-in based on risk signals like device, location and behaviour.',
        updated: '2026-08-30',
        keywords: ['adaptive', 'risk', 'context', 'conditional access', 'policy', 'location'],
        sections: [
          { id: 'overview', title: 'Overview', html: `<p>Not every sign-in carries the same risk. An employee on a managed laptop in the office is lower risk than an unknown device in a new country. Adaptive authentication lets Fixiam reduce friction for low-risk sign-ins and add checks for high-risk ones.</p>` },
          { id: 'signals', title: 'Signals Fixiam evaluates', html: `<ul><li><strong>Device</strong>: is it enrolled and compliant with your device policy?</li><li><strong>Network</strong>: is the request from a trusted IP range?</li><li><strong>Location</strong>: is it a country the user normally signs in from?</li><li><strong>Behaviour</strong>: has this user failed sign-in several times recently?</li></ul>` },
          { id: 'outcomes', title: 'Possible outcomes', html: `${table(['Risk', 'Typical outcome'], [['Low', 'Allow with password or existing session'], ['Medium', 'Require an MFA factor'], ['High', 'Require a phishing-resistant factor or deny']])}` },
        ],
        terms: [{ term: 'Risk signal', def: 'A piece of context about a sign-in that changes how risky it is likely to be.' }],
        related: { concepts: ['multi-factor-authentication', 'device-management'], guides: ['configure-mfa', 'create-device-policy'] },
      },

      saml: {
        title: 'SAML',
        summary: 'Security Assertion Markup Language (SAML 2.0) is an XML-based standard that lets Fixiam securely tell an application who a user is.',
        updated: '2026-09-10',
        keywords: ['saml', 'saml 2.0', 'assertion', 'xml', 'metadata', 'acs', 'entity id', 'sso'],
        sections: [
          { id: 'what-is-saml', title: 'What is SAML?', html: `<p>SAML 2.0 is one of the two main standards used for <a href="#/concepts/single-sign-on">Single Sign On</a>. It has been widely adopted by enterprise applications for over a decade and is supported by most SaaS products.</p>` },
          { id: 'key-parts', title: 'The key parts of a SAML integration', html: `${table(['Setting', 'Set by', 'Purpose'], [
            ['Entity ID', 'Both sides', 'A unique name for each party in the trust relationship.'],
            ['ACS URL', 'Application', 'Where Fixiam sends the assertion after sign-in.'],
            ['SSO URL', 'Fixiam', 'Where the application sends users to sign in.'],
            ['Signing certificate', 'Fixiam', 'Lets the application verify the assertion was not tampered with.'],
            ['NameID', 'Fixiam', 'The user identifier, usually the email address.'],
          ])}` },
          { id: 'assertion', title: 'What an assertion looks like', html: `<p>After Fixiam verifies a user, it sends a signed XML document to the application. This simplified example shows the parts an application reads.</p>${code(`<saml:Assertion ID="_fx8c21" IssueInstant="2026-10-05T09:14:22Z">
  <saml:Issuer>https://acme.fixiam.com</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="emailAddress">amara.okafor@acme.com</saml:NameID>
  </saml:Subject>
  <saml:Conditions NotOnOrAfter="2026-10-05T09:19:22Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://salesforce.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AttributeStatement>
    <saml:Attribute Name="department"><saml:AttributeValue>Finance</saml:AttributeValue></saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>`, 'XML')}` },
          { id: 'saml-or-oidc', title: 'SAML or OpenID Connect?', html: `<p>Use whichever the application supports. If it supports both, <a href="#/concepts/openid-connect">OpenID Connect</a> is usually simpler for modern web and mobile apps, while SAML is common for established enterprise software.</p>` },
        ],
        terms: [
          { term: 'Metadata', def: 'An XML file that contains an entity’s SAML settings, used to configure the other side quickly.' },
          { term: 'ACS', def: 'Assertion Consumer Service. The application endpoint that receives SAML assertions.' },
        ],
        related: { concepts: ['single-sign-on', 'openid-connect'], guides: ['configure-saml-sso', 'add-application'] },
      },

      'openid-connect': {
        title: 'OpenID Connect',
        summary: 'OpenID Connect (OIDC) is an identity layer built on OAuth 2.0 that modern web and mobile applications use for Single Sign On.',
        updated: '2026-09-10',
        keywords: ['oidc', 'openid', 'openid connect', 'oauth', 'id token', 'jwt', 'client id'],
        sections: [
          { id: 'what-is-oidc', title: 'What is OpenID Connect?', html: `<p>OpenID Connect adds identity to OAuth 2.0. Where OAuth answers “can this app access this data?”, OIDC also answers “who is the user?” by returning a signed <strong>ID token</strong>.</p>` },
          { id: 'tokens', title: 'Tokens you will see', html: `${table(['Token', 'Purpose'], [['ID token', 'Proves who the user is. A signed JSON Web Token (JWT).'], ['Access token', 'Lets the application call APIs on the user’s behalf.'], ['Refresh token', 'Lets the application get new tokens without asking the user to sign in again.']])}` },
          { id: 'flows', title: 'Authorization code flow', html: `<p>Fixiam supports the authorization code flow with PKCE, which is the recommended flow for web, mobile and single page applications.</p>` },
        ],
        terms: [{ term: 'Client ID', def: 'The public identifier Fixiam issues to an OIDC application.' }, { term: 'Redirect URI', def: 'The application URL that Fixiam returns the user to after sign-in.' }],
        related: { concepts: ['single-sign-on', 'saml'], guides: ['configure-oidc-sso'] },
      },

      scim: {
        title: 'SCIM',
        summary: 'System for Cross-domain Identity Management (SCIM) is a standard API for creating, updating and removing user accounts across systems.',
        updated: '2026-08-14',
        keywords: ['scim', 'provisioning', 'deprovisioning', 'api', 'sync'],
        sections: [
          { id: 'what-is-scim', title: 'What is SCIM?', html: `<p>SCIM defines a common REST API and JSON schema for user and group records. When two systems both speak SCIM, one can keep accounts in the other up to date automatically.</p>` },
          { id: 'directions', title: 'Inbound and outbound SCIM', html: `<ul><li><strong>Inbound SCIM</strong>: another system, such as an HR platform, pushes users into Fixiam.</li><li><strong>Outbound SCIM</strong>: Fixiam pushes users into a connected application, so accounts exist before the first sign-in.</li></ul>` },
          { id: 'why', title: 'Why SCIM matters for lifecycle', html: `<p>SSO controls sign-in, but the account inside the application still needs to exist and be removed when someone leaves. SCIM closes that gap so <a href="#/concepts/joiner-mover-leaver">joiner, mover and leaver</a> events reach every application.</p>` },
        ],
        terms: [{ term: 'Provisioning', def: 'Creating an account in a target system.' }, { term: 'Deprovisioning', def: 'Disabling or deleting an account when access is no longer needed.' }],
        related: { concepts: ['identity-lifecycle', 'joiner-mover-leaver'], guides: ['configure-inbound-scim', 'connect-hr-source'] },
      },

      'identity-lifecycle': {
        title: 'Identity lifecycle management',
        summary: 'Identity lifecycle management keeps every account accurate from a person’s first day to their last, without manual tickets.',
        updated: '2026-09-15',
        keywords: ['lifecycle', 'provisioning', 'onboarding', 'offboarding', 'automation', 'hr'],
        sections: [
          { id: 'overview', title: 'What is identity lifecycle management?', html: `<p>Every identity has a lifecycle. It is created when someone joins, changes as they move through the organization, and is removed when they leave. Lifecycle management automates each of these changes so access always matches a person’s current situation.</p>` },
          { id: 'source-of-truth', title: 'The source of truth', html: `<p>Automation starts with a trusted <a href="#/concepts/identity-sources">identity source</a>, usually your HR system. When HR records a hire, transfer or termination, Fixiam receives the change and acts on it.</p>${fitDiagram}` },
          { id: 'what-gets-automated', title: 'What gets automated', html: `<ul><li>Account creation with the correct profile attributes</li><li>Group membership based on department, location and job title</li><li>Application assignment and provisioning through SCIM</li><li>Suspension and session revocation at termination</li></ul>${tip('Automated deprovisioning is the most valuable part of lifecycle management. Former employees with active accounts are one of the most common audit findings.')}` },
        ],
        terms: [{ term: 'Attribute mapping', def: 'Rules that decide which field in the source system fills which field in Fixiam.' }, { term: 'Group rule', def: 'A condition, such as department equals Finance, that adds users to a group automatically.' }],
        related: { concepts: ['joiner-mover-leaver', 'scim', 'identity-sources'], guides: ['connect-hr-source', 'configure-sagehr', 'deactivate-user'] },
      },

      'joiner-mover-leaver': {
        title: 'Joiner, Mover and Leaver',
        summary: 'Joiner, Mover and Leaver (JML) describes the three events in an employee’s lifecycle that should change their access.',
        updated: '2026-09-15',
        keywords: ['jml', 'joiner', 'mover', 'leaver', 'onboarding', 'offboarding', 'transfer', 'termination'],
        sections: [
          { id: 'three-events', title: 'The three events', html: `<p>JML is a simple model for thinking about access changes. Each event starts in your identity source and should end with the right access in every application.</p>${jmlDiagram}` },
          { id: 'joiner', title: 'Joiner', html: `<p>A joiner needs to be productive on day one. Fixiam creates the account from HR data before the start date, adds the person to groups based on their department, and sends an activation email on the morning they start.</p>` },
          { id: 'mover', title: 'Mover', html: `<p>Movers are the hardest event to get right manually. People collect access as they change roles, which leads to <strong>privilege creep</strong>. Fixiam recalculates group rules on every change so old access is removed as new access is granted.</p>` },
          { id: 'leaver', title: 'Leaver', html: `<p>When employment ends, every minute of remaining access is a risk. Fixiam suspends the account at the termination time in HR, revokes active sessions, and deprovisions SCIM-connected applications.</p>${important('Schedule leaver processing for the end of the employee’s last working day, not the date HR enters the record, to avoid cutting off access early.')}` },
        ],
        terms: [{ term: 'Privilege creep', def: 'The gradual build-up of access a person no longer needs.' }],
        related: { concepts: ['identity-lifecycle', 'scim', 'roles-and-permissions'], guides: ['connect-hr-source', 'deactivate-user', 'configure-seamlesshr'] },
      },

      'identity-sources': {
        title: 'Identity sources',
        summary: 'An identity source is the system Fixiam treats as authoritative for who your people are, such as an HR platform or a directory.',
        updated: '2026-08-27',
        keywords: ['identity source', 'directory', 'active directory', 'google', 'hr', 'source of truth'],
        sections: [
          { id: 'overview', title: 'What is an identity source?', html: `<p>Fixiam can hold users directly, but most organizations already manage people somewhere else. Connecting that system as an identity source means Fixiam stays in sync automatically.</p>` },
          { id: 'types', title: 'Supported source types', html: `${table(['Source type', 'Examples', 'Best for'], [['HR system', 'SageHR, SeamlessHR', 'Organizations where HR is the first place a hire is recorded'], ['Directory', 'Active Directory, Google Workspace', 'Organizations with an established directory'], ['SCIM', 'Any SCIM 2.0 client', 'Custom or less common systems']])}` },
          { id: 'priority', title: 'Using more than one source', html: `<p>You can connect several sources and decide which one wins for each attribute. A common pattern is HR for job details and Active Directory for usernames and groups.</p>` },
        ],
        terms: [{ term: 'Source of truth', def: 'The system whose data takes priority when two systems disagree.' }],
        related: { concepts: ['identity-lifecycle', 'scim'], guides: ['connect-active-directory', 'import-users-from-google', 'connect-hr-source'] },
      },

      'device-management': {
        title: 'Device management',
        summary: 'Fixiam Device Management enrolls company laptops and desktops, checks them against policy, and uses device trust in sign-in decisions.',
        updated: '2026-10-01',
        keywords: ['device', 'devices', 'endpoint', 'enrollment', 'compliance', 'windows', 'macos', 'device trust'],
        sections: [
          { id: 'overview', title: 'What is device management?', html: `<p>Identity is only half of a trustworthy sign-in. The other half is the device. Device management lets you know which devices belong to your organization and whether they meet your security standards.</p>` },
          { id: 'how-it-works', title: 'How it works', html: `<ol><li>An administrator or user enrolls a device by installing the Fixiam Device Agent.</li><li>The agent reports device posture, such as disk encryption, OS version and screen lock.</li><li>Fixiam compares the posture with your <a href="#/guides/create-device-policy">device policy</a>.</li><li>Sign-in policies can require a compliant device for sensitive applications.</li></ol>` },
          { id: 'states', title: 'Device states', html: `${table(['State', 'Meaning'], [['Enrolled', 'The agent is installed and reporting.'], ['Compliant', 'The device meets every rule in its policy.'], ['Non-compliant', 'At least one rule is failing. The user is told how to fix it.'], ['Retired', 'The device has been removed from management.']])}` },
        ],
        terms: [{ term: 'Device posture', def: 'The security state of a device at a point in time.' }, { term: 'Device trust', def: 'Using device posture as a signal in authentication decisions.' }],
        related: { concepts: ['adaptive-authentication', 'multi-factor-authentication'], guides: ['enroll-windows-device', 'enroll-macos-device', 'create-device-policy', 'check-device-compliance'] },
      },

      'access-requests': {
        title: 'Access requests and approvals',
        summary: 'Access requests let people ask for the access they need, and route each request to the right approvers with a full audit trail.',
        updated: '2026-09-05',
        keywords: ['access request', 'approval', 'governance', 'workflow', 'request access'],
        sections: [
          { id: 'overview', title: 'Why access requests?', html: `<p>Birthright access covers what everyone in a group needs. For everything else, people need a way to ask. Access requests replace emails and tickets with a consistent workflow that records who asked, who approved and why.</p>` },
          { id: 'flow', title: 'The request flow', html: `<ol><li>A user requests an application, role or group from the Fixiam dashboard.</li><li>Fixiam routes the request through the configured <strong>approval levels</strong>, such as manager then application owner.</li><li>When the final approver accepts, access is granted automatically, optionally for a limited time.</li></ol>` },
          { id: 'time-bound', title: 'Time-bound access', html: `<p>Requests can include an end date. Fixiam removes the access when the period ends, which is useful for contractors and project work.</p>` },
        ],
        terms: [{ term: 'Approval level', def: 'One step in an approval chain. Each level can have one or more approvers.' }],
        related: { concepts: ['roles-and-permissions', 'privileged-access-management'], guides: ['create-access-request', 'configure-approval-levels', 'review-and-approve-requests'] },
      },

      'privileged-access-management': {
        title: 'Privileged Access Management',
        summary: 'Privileged Access Management (PAM) applies extra control to the small number of accounts that can change systems or reach sensitive data.',
        updated: '2026-07-22',
        keywords: ['pam', 'privileged', 'admin', 'just in time', 'elevated access'],
        sections: [
          { id: 'overview', title: 'What is privileged access?', html: `<p>Privileged accounts can change configuration, read sensitive data or grant access to others. They are the most valuable target for attackers, so they deserve stronger controls than ordinary accounts.</p>` },
          { id: 'principles', title: 'Core principles', html: `<ul><li><strong>Just-in-time access</strong>: grant elevated access only when needed and remove it automatically.</li><li><strong>Strong authentication</strong>: require phishing-resistant factors for privileged roles.</li><li><strong>Full audit</strong>: record every privileged action for review.</li></ul>` },
        ],
        terms: [{ term: 'Just-in-time (JIT) access', def: 'Elevated access granted for a short, approved period.' }],
        related: { concepts: ['access-requests', 'multi-factor-authentication'], guides: ['invite-administrators', 'configure-approval-levels'] },
      },
    },
  };
})();
