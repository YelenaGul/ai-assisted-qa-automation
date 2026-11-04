# Generated from Jira DS-2: Edit existing program details
# Review before automating.
# Live UI recon skipped on 2026-11-04: DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset, so the app was not opened this run.
# Locator hints below come from the existing suite (tests/helpers/didaxis.ts) and the 2026-10-27 DS-3 pass, not from a new browser session:
# - Heading: "Programs"
# - Row button: "Edit <program name>"
# - Dialog: "Edit Program"
# - Textbox: "Program Name"
# - Textbox: "Description"
# - Button: "Save"
# - Button: "Cancel"
# - List shows the program name and description on the row

Feature: DS-2 Edit existing program details

  # Happy paths

  Scenario: Edit form opens with the program's current name and description
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists with description "Full-stack web development program"
    When I click "Edit Web Development 2026"
    Then the "Edit Program" dialog is open
    And "Program Name" shows "Web Development 2026"
    And "Description" shows "Full-stack web development program"

  Scenario: Saving a new name closes the dialog and updates the list
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing that program in the "Edit Program" dialog
    When I change "Program Name" to "Web Development 2026 - Updated"
    And I click "Save"
    Then the "Edit Program" dialog closes
    And the Programs list shows "Web Development 2026 - Updated"
    And the Programs list does not show the previous name "Web Development 2026"

  Scenario: Changing only the description leaves the name unchanged
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing that program in the "Edit Program" dialog
    When I change "Description" to "Updated curriculum overview"
    And I leave "Program Name" as "Web Development 2026"
    And I click "Save"
    Then the "Edit Program" dialog closes
    And the Programs list still shows "Web Development 2026"
    And that row shows description "Updated curriculum overview"

  # Negative

  Scenario: Cancel discards an unsaved name change
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing that program in the "Edit Program" dialog
    When I change "Program Name" to "Should Not Persist"
    And I click "Cancel"
    Then the "Edit Program" dialog closes
    And the Programs list still shows "Web Development 2026"
    And the Programs list does not show "Should Not Persist"

  Scenario: An empty Program Name cannot be saved
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists
    And I am editing that program in the "Edit Program" dialog
    When I clear "Program Name"
    Then the "Save" button is disabled
    And the "Edit Program" dialog stays open
    And the Programs list still shows "Web Development 2026"

  # Edge cases

  Scenario: A whitespace-only Program Name cannot be saved
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists
    And I am editing that program in the "Edit Program" dialog
    When I set "Program Name" to "   "
    Then the "Save" button is disabled
    And the "Edit Program" dialog stays open
    And the Programs list still shows "Web Development 2026"

  Scenario: Leading and trailing spaces are removed from the saved Program Name
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists
    And I am editing that program in the "Edit Program" dialog
    When I set "Program Name" to "  Web Development 2026 - Updated  "
    And I click "Save"
    Then the "Edit Program" dialog closes
    And the Programs list shows "Web Development 2026 - Updated"
    And the Programs list does not show a name that still has those leading or trailing spaces

  Scenario: Special characters in the name and description are kept after save
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing that program in the "Edit Program" dialog
    When I change "Program Name" to "Informatique & IA - Niveau 2"
    And I change "Description" to "Cours: advanced & basics"
    And I click "Save"
    Then the "Edit Program" dialog closes
    And the Programs list shows "Informatique & IA - Niveau 2"
    And that row shows description "Cours: advanced & basics"

# ---
# Ambiguities / gaps (resolve before automation):
# - Live UI recon was skipped this run because DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset. Steps use control names already encoded in tests/helpers/didaxis.ts (dialog "Edit Program", buttons "Save" and "Cancel", row button "Edit <program name>"). They were not re-checked in a browser on 2026-11-04.
# - The ticket's sample name "Web Development 2026" already appears many times in the shared test environment. Automation should prefix that name with a unique suffix and still assert the ticket wording (updated suffix " - Updated", description change, special characters).
# - Ticket does not say whether Description is required. The create form treats Description as optional. This feature assumes an edit can save when only the name changes and Description is left as-is.
# - Empty and whitespace-only names are not in the DS-2 acceptance criteria. The existing DS-2 spec expects "Save" to be disabled for "" and "   ", matching the create-form behavior recorded for DS-3 on 2026-10-27. This run did not re-confirm that on the edit dialog.
# - Uniqueness on rename is not in the acceptance criteria. A 2026-10-27 note on DS-3 says an exact duplicate create is accepted with no error. Do not assert a duplicate-name error on edit until a live pass records the copy or confirms there is no message.
# - No maximum length is stated on DS-2. Do not assert a 100-character limit in this feature.
# - Network failures (save 503, malformed PATCH/PUT body, 401/403) were not reproduced this run. No error or empty-state copy was observed, so those cases are not scenarios here. Do not invent banner text.
