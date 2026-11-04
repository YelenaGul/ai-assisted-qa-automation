# Generated from Jira DS-270: [Raya + Create new academic program]
# Cloned from DS-1.
# Live UI recon skipped this run (2026-11-04): DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset and there is no .env.
# Locator hints are from the existing suite (features/DS-3.feature, browser MCP on 2026-10-27), not a new walk.
# Review before automating.
#
# Locator hints (prior suite, not re-verified this run):
# - Page heading: Programs
# - Button: "+ New Program" (accessible name includes "New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required)
# - Textbox: "Description" (optional in the existing suite)
# - Button: "Create" (disabled while Program Name is empty or whitespace-only)
# - Button: "Cancel"

Feature: DS-270 Create new academic program

  # Happy paths

  Scenario: Admin opens the program creation form
    Given I am logged in as an admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the "New Program" dialog
    And I see a "Program Name" textbox
    And I see a "Description" textbox
    And I see a "Create" button

  Scenario: Created program appears in the list and the dialog closes
    Given I am logged in as an admin
    And the "New Program" dialog is open
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

  # Negative

  Scenario: Empty Program Name keeps Create disabled
    Given I am logged in as an admin
    And the "New Program" dialog is open
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And the "New Program" dialog stays open
    And no new program is added to the Programs list

  # Edge cases

  Scenario: Program can be created when Description is empty
    Given I am logged in as an admin
    And the "New Program" dialog is open
    When I fill in "Program Name" with "Web Development 2026"
    And I leave "Description" empty
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

  Scenario: Create stays on the form when saving the program returns 503
    Given I am logged in as an admin
    And the "New Program" dialog is open
    And the program save request will fail with HTTP 503
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the "New Program" dialog stays open
    And the Programs heading is still visible
    And the Programs list does not show a program created by this failed save

# ---
# Ambiguities / gaps (resolve before automation):
# - Live UI recon was skipped. DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset. Control names are from the 2026-10-27 suite notes, not a 2026-11-04 walk.
# - The ticket says the creation form appears after "+ New Program". The existing suite opens a dialog titled "New Program", not a separate route.
# - Empty Description is not an acceptance criterion on DS-270. The DS-1 plan and existing suite treat Description as optional. Included as an edge; drop it if this form makes Description required.
# - HTTP 503 copy was not observed. Assert only that the dialog stays open, the Programs heading remains, and this attempt does not add a listed program. Do not invent toast or banner text.
# - Empty list, malformed JSON, 401, 403, and 404 were not walked. They are out of scope for this create ticket until a live pass records the copy.
# - Shared data already uses "Web Development 2026". Automation should append a unique suffix and delete the program it creates. Assertions still cover the ticket's name and description wording.
# - Duplicate names belong to DS-271.
