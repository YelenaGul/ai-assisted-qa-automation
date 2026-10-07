# Generated from Jira DS-2: Edit existing program details
# Review before automating.

Feature: DS-2 Edit existing program details

  # Happy paths

  Scenario: Edit form opens pre-populated for an existing program
    Given I am logged in as an admin user
    And I am on the Programs page
    And a program named "Web Development 2026" exists in the list
    When I click the edit control on "Web Development 2026"
    Then I see the Edit Program form
    And Program Name is pre-filled with "Web Development 2026"
    And Description is pre-filled with the program's current description

  Scenario: Program name update is saved and reflected in the list
    Given I am logged in as an admin user
    And I am editing the program "Web Development 2026"
    When I change Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the Edit Program modal closes
    And the Programs list shows "Web Development 2026 - Updated"
    And the Programs list does not show "Web Development 2026" as the name for that program

  Scenario: Changing only Description leaves Program Name unchanged
    Given I am logged in as an admin user
    And I am editing a program whose Program Name is "Web Development 2026"
    And the current Description is "Full-stack web development program"
    When I change Description to "Updated curriculum overview"
    And I leave Program Name unchanged
    And I click Save
    Then the Edit Program modal closes
    And the Programs list still shows Program Name "Web Development 2026"
    And the Programs list shows Description "Updated curriculum overview" for that program

  Scenario: Canceling edit discards unsaved changes
    Given I am logged in as an admin user
    And I am editing the program "Web Development 2026"
    When I change Program Name to "Should Not Persist"
    And I cancel or close the Edit Program modal without saving
    Then the Programs list still shows "Web Development 2026"

  # Negative

  Scenario: Save is blocked when Program Name is cleared on edit
    Given I am logged in as an admin user
    And I am editing an existing program
    When I clear Program Name completely
    Then the Save button is disabled or a validation error is shown
    And the program is not saved with an empty name

  Scenario: Renaming to an existing program name is rejected
    Given I am logged in as an admin user
    And programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I change Program Name to "Web Development 2026"
    And I click Save
    Then I see an error indicating the name already exists
    And "Data Science 2026" remains unchanged in the list

  Scenario: Case-variant duplicate name on edit is rejected
    Given I am logged in as an admin user
    And a program named "Web Development 2026" exists
    And I am editing a different program
    When I change Program Name to "web development 2026"
    And I click Save
    Then duplicate-name validation prevents the rename
    And the edited program keeps its original name

  Scenario: Program Name over the maximum allowed length is rejected on edit
    Given I am logged in as an admin user
    And I am editing an existing program
    When I change Program Name to a string longer than the allowed maximum
    And I click Save
    Then Save is disabled or a validation error is shown
    And the program name in the list is not updated to the over-length value

  # Edge cases

  Scenario: Special characters in edited Program Name are preserved after Save
    Given I am logged in as an admin user
    And I am editing an existing program
    When I change Program Name to "Informatique & IA - Niveau 2"
    And I click Save
    Then the Programs list shows exactly "Informatique & IA - Niveau 2"

  Scenario: Unicode and emoji in edited fields are preserved after Save
    Given I am logged in as an admin user
    And I am editing an existing program
    When I change Description to "Cohort 🎓 — été 2026"
    And I click Save
    Then the Programs list shows that description for the program

  Scenario: Double-clicking Save submits only one update
    Given I am logged in as an admin user
    And I am editing the program "Web Development 2026"
    When I change Description to "Single save test"
    And I double-click Save quickly
    Then the Edit Program modal closes once
    And exactly one program row exists for the updated program

  Scenario: Leading and trailing spaces in renamed Program Name are trimmed on save
    Given I am logged in as an admin user
    And I am editing the program "Web Development 2026"
    When I change Program Name to "  Web Development 2026 - Updated  "
    And I click Save
    Then the Programs list shows "Web Development 2026 - Updated" without extra spaces

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket uses "edit icon" and field label "Name" in ACs; UI may use "Edit Program" dialog and "Program Name" — align selectors with product copy.
# - Maximum Program Name length on edit is not in DS-2 ACs (related bugs cite 100 vs 255 characters).
# - Duplicate-name rules on edit are implied by linked defects but not in the three written ACs.
# - Behavior when Save is clicked with no field changes is not specified (disabled Save vs no-op).
# - Server error handling during Save is not in ACs; modal state and data integrity on failure need product rules.
# - How to open edit when row actions use emoji vs image icons is an environment/UI inconsistency in linked bugs.
