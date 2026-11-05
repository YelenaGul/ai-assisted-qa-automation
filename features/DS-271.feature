# Generated from Jira DS-271: [Raya + Program name validation and duplicate prevention]
# Cloned from DS-3.
# Review before automating.
# Live UI recon skipped on 2026-11-04: DIDAXIS_EMAIL and DIDAXIS_PASSWORD are not set.
#
# Locator hints from existing page objects and features/DS-3.feature (not re-checked live this run):
# - Page heading: Programs
# - Button accessible name includes "New Program"
# - Dialog: "New Program"
# - Textbox: "Program Name" (required)
# - Textbox: "Description" (optional)
# - Button: "Create" (disabled while Program Name is empty or whitespace-only, per 2026-10-27 notes)
# - Button: "Cancel"

Feature: DS-271 Program name validation and duplicate prevention

  # Happy paths

  Scenario: Program name with special characters is created and listed
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I enter "Informatique & IA - Niveau 2" in "Program Name"
    And I enter "Full-stack curriculum with ampersand" in "Description"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Informatique & IA - Niveau 2"

  # Negative

  Scenario: Whitespace-only Program Name cannot be submitted
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "   " in "Program Name"
    Then the "Create" button is disabled
    And the "New Program" dialog stays open
    And the Programs list does not show a program named "   "

  Scenario: Duplicate Program Name is rejected with an error
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" already exists
    When I click "+ New Program"
    And I enter "Web Development 2026" in "Program Name"
    And I enter "Second attempt" in "Description"
    And I click "Create"
    Then the "New Program" dialog stays open
    And I see an error indicating the name already exists
    And the Programs list still shows only one "Web Development 2026"

  # Edge cases

  Scenario: Empty Program Name keeps Create disabled
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And the "New Program" dialog stays open

  Scenario: Leading and trailing spaces are removed from the saved Program Name
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I enter "  Informatique & IA - Niveau 2  " in "Program Name"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Informatique & IA - Niveau 2"
    And the Programs list does not show a program whose name still has those leading or trailing spaces

# ---
# Ambiguities / gaps (resolve before automation):
# - Live UI recon was skipped this run because DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset. Steps follow the 2026-10-27 notes in features/DS-3.feature and pages/NewProgramModal.ts.
# - Ticket says "fill other required fields". Prior notes say Program Name is the only required field. Description is optional. Default Session Hours is prefilled with 4 and Default Exam Hours with 3.
# - Ticket whitespace AC says click Create because the name is trimmed and treated as empty. Prior notes say Create is disabled for "   " and for an empty name, so Create cannot be clicked. Scenarios assert the disabled button and the dialog staying open.
# - Exact duplicate error copy is not specified. On 2026-10-27 the live app accepted an exact duplicate: the dialog closed, no alert was shown, and a second row appeared. Related bugs include DS-249 and DS-201. The expected result remains the ticket AC (error, dialog stays open, one row). Do not weaken the assertion to match that defect. If a second id is created, still track it for cleanup.
# - Uniqueness rules not stated: case sensitivity, internal double spaces, and whether a trimmed name that matches an existing name counts as a duplicate.
# - This ticket does not state a maximum Program Name length. Do not add a 100-character scenario as an acceptance criterion.
# - Shared data already contains "Web Development 2026" and "Informatique & IA - Niveau 2". Automation should keep those phrases and add a unique suffix, then delete created programs.
# - HTTP error copy for a failed save was not recorded this run. Network-failure scenarios are omitted until a live pass records the message.
