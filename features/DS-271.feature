# Generated from Jira DS-271: [Raya + Program name validation and duplicate prevention]
# Cloned from DS-3.
# Live UI recon skipped this run (2026-11-04): DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset and there is no .env.
# Locator hints and the duplicate-name observation are from features/DS-3.feature (browser MCP on 2026-10-27), not a new walk.
# Review before automating.
#
# Locator hints (prior suite, not re-verified this run):
# - Page heading: Programs
# - Button: "+ New Program" (accessible name includes "New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required, placeholder "e.g. Computer Science BSc")
# - Textbox: "Description" (optional, placeholder "Brief description")
# - Button: "Create" (disabled while Program Name is empty or whitespace-only)
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
# - Live UI recon was skipped. DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset. Control names are from the 2026-10-27 suite notes, not a 2026-11-04 walk.
# - Ticket says "fill other required fields". On the previously verified form, Program Name is the only required field. Description is optional.
# - Ticket whitespace AC says click Create because the name is trimmed and treated as empty. The previously verified UI disables Create for "   " and for an empty name, so Create cannot be clicked. Scenarios assert the disabled button and the dialog staying open.
# - Ticket expects a duplicate-name error. The 2026-10-27 walk found the app accepts an exact duplicate: the dialog closes, no error is shown, and a second row appears (related bugs DS-249 and DS-201). Do not treat that as the expected result. Assert the ticket: dialog stays open, an already-exists error is visible, and only one row remains. Exact copy was not re-checked this run; use the existing name-validation error locator.
# - Uniqueness rules are not stated: case sensitivity, internal double spaces, and whether a trimmed name that matches an existing name counts as a duplicate.
# - DS-271 does not state a maximum Program Name length. Do not add a length scenario from other notes.
# - Shared data already contains "Web Development 2026" and "Informatique & IA - Niveau 2". Automation should append a unique suffix and delete programs it creates, while still asserting the ticket's special characters, whitespace, and duplicate-of-an-existing-name behavior.
# - HTTP error copy was not observed this run. Network failure scenarios are out of scope for this validation ticket until a live pass records the copy.
