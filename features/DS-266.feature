# Generated from Jira DS-266: Julia CLONE - Program name validation and duplicate prevention
# Review before automating.
# Live UI recon skipped on 2026-11-04: DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset, so the app was not opened this run.
# This ticket is a clone of DS-3. Locator hints and the 2026-10-27 notes below are inherited from features/DS-3.feature. They were not re-checked in a browser on this run.
#
# Locator hints:
# - Page heading: Programs
# - Button: "+ New Program" (accessible name includes "New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required, placeholder "e.g. Computer Science BSc")
# - Textbox: "Description" (optional, placeholder "Brief description")
# - Button: "Create" (disabled while Program Name is empty or whitespace-only)
# - Button: "Cancel"
# - List row actions: "Edit <program name>", "Delete <program name>"

Feature: DS-266 Julia CLONE - Program name validation and duplicate prevention

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
# - Live UI recon was skipped this run. The notes below are from the DS-3 pass on 2026-10-27, not a new browser session.
# - Ticket says "fill other required fields" on create. On the 2026-10-27 form, Program Name is the only required field. Description, Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, and Focus Areas are optional. Default Session Hours is prefilled with 4 and Default Exam Hours with 3.
# - Ticket whitespace AC says click Create and the form is not submitted because the name is trimmed and treated as empty. The 2026-10-27 UI disables Create for "   " and for an empty name, so Create cannot be clicked. Scenarios assert the disabled button and the dialog staying open.
# - Exact duplicate error copy is not specified. On 2026-10-27 the app accepted an exact duplicate: the dialog closed, no alert or error was shown, and a second row appeared. Known related bugs include DS-249 and DS-201. Do not treat that bug behavior as the expected result. The scenario still expects an error and a single row.
# - Uniqueness rules not stated: case sensitivity, internal double spaces, and whether a trimmed name that matches an existing name counts as a duplicate.
# - DS-266 does not state a maximum Program Name length. Do not assert a 100-character limit.
# - Shared test data already contains many "Web Development 2026" and "Informatique & IA - Niveau 2…" rows. Automation should use a unique suffix and clean up created programs, while still asserting the ticket's values.
# - Network failures were not reproduced this run. No new error copy was observed. Do not invent banner text. Do not add page.route tests.
