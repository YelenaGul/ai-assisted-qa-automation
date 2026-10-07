# Generated from Jira DS-1: Create new academic program
# Review before automating.

Feature: DS-1 Create new academic program

  # Happy paths

  Scenario: Program creation form opens from Programs page with required fields
    Given I am logged in as an admin user
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the New Program creation form
    And the form includes a Program Name field
    And the form includes a Description field
    And I see a Create action for submitting the form

  Scenario: A valid program is created and appears in the program list
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I click Create
    Then the New Program modal closes
    And the Programs list shows a row for "Web Development 2026"

  Scenario: Program can be created with an empty Description
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "Web Development 2026"
    And I leave Description empty
    And I click Create
    Then the New Program modal closes
    And the Programs list shows a row for "Web Development 2026"

  # Negative

  Scenario: Create stays disabled when Program Name is empty
    Given I am logged in as an admin user
    And I am on the program creation form
    When I leave the Program Name field empty
    And I fill Description with "Full-stack web development program"
    Then the Create button is disabled
    And no new program is added to the Programs list

  Scenario: Whitespace-only Program Name does not create a program
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with only spaces
    Then either the Create button is disabled
    Or clicking Create does not close the modal and does not add a program with a blank name to the list

  Scenario: Duplicate program name is rejected on create
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists in the Programs list
    And I am on the program creation form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Another description"
    And I click Create
    Then I see a clear validation or error message about duplicate program name
    And the New Program modal remains open or the program is not saved
    And the Programs list still contains only one program named "Web Development 2026"

  Scenario: Case-variant duplicate program name is rejected on create
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists in the Programs list
    And I am on the program creation form
    When I fill Program Name with "web development 2026"
    And I click Create
    Then duplicate-name validation prevents creating a second program
    And the Programs list still contains only one program for that name (case-insensitive)

  Scenario: Program name longer than the allowed maximum is rejected
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with a string longer than the maximum allowed length
    And I fill Description with "Full-stack web development program"
    And I click Create
    Then I see a validation message for Program Name length
    And the program is not created

  Scenario: Description longer than the allowed maximum is rejected
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with a string longer than the maximum allowed length
    And I click Create
    Then I see a validation message for Description length
    And the program is not created

  # Edge cases

  Scenario: Program name with special characters is accepted and shown in the list
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "Pay & Learn (50%) — QA"
    And I fill Description with "Special characters in title"
    And I click Create
    Then the New Program modal closes
    And the Programs list shows "Pay & Learn (50%) — QA"

  Scenario: Program name at maximum allowed length is accepted
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with exactly the maximum allowed number of characters
    And I fill Description with "Boundary length check"
    And I click Create
    Then the New Program modal closes
    And the Programs list shows the program with the full entered name

  Scenario: Leading and trailing spaces in Program Name are trimmed before save
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "  Web Development 2026  "
    And I fill Description with "Trim test"
    And I click Create
    Then the New Program modal closes
    And the Programs list shows "Web Development 2026" without leading or trailing spaces

  Scenario: Double-clicking Create submits only once
    Given I am logged in as an admin user
    And I am on the program creation form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I double-click Create quickly
    Then exactly one new program named "Web Development 2026" is added from this submission
    And the New Program modal closes once

  Scenario: Dismissing the modal without saving leaves the list unchanged
    Given I am logged in as an admin user
    And I am on the program creation form
    And I fill Program Name with "Unsaved Program"
    When I cancel or close the New Program modal without clicking Create
    Then the New Program modal closes
    And the Programs list does not show "Unsaved Program"

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket ACs do not state whether Description is required; scenarios assume it is optional.
# - Maximum length for Program Name is unclear (related bugs mention 100 vs 255 characters).
# - Maximum length for Description is unclear (related bugs mention 500 vs 2000 characters).
# - Duplicate-name rules (exact vs case-insensitive) are not in the ticket ACs; subtasks suggest uniqueness is expected.
# - Whitespace-only and trim behavior for Program Name are not specified in ACs.
# - Double-submit / double-click guard is not in ACs; included because of linked defect reports.
# - Cancel/close control label and behavior (X vs Cancel) are not defined in the ticket.
# - Non-admin roles and API failure messaging are out of scope for the three written ACs.
# - Confluence reference "Program Setup & Management > Overview" may add fields or rules not reflected in Jira ACs.
