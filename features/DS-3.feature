# Generated from Jira DS-3: Program name validation and duplicate prevention
# Review before automating.

Feature: DS-3 Program name validation and duplicate prevention

  # Happy paths

  Scenario: Program name with special characters is created successfully
    Given I am logged in as an admin user
    And I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as Program Name
    And I fill Description with a valid value
    And I click Create
    Then the New Program modal closes
    And the Programs list includes "Informatique & IA - Niveau 2"

  Scenario: Valid unique program name after correcting a duplicate attempt
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "Web Development 2026" as Program Name
    And I see an error indicating the name already exists
    And I change Program Name to "Web Development 2027"
    And I click Create
    Then the program "Web Development 2027" is created successfully

  # Negative

  Scenario: Whitespace-only program name is not submitted
    Given I am logged in as an admin user
    And I am on the program creation form
    When I enter "   " as Program Name
    And I fill Description with "Whitespace validation test"
    And I click Create if the button is enabled
    Then the form is not submitted
    And the name is trimmed and treated as empty
    And no new program is added to the Programs list

  Scenario: Duplicate program name on create shows an error
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I try to create a new program with Program Name "Web Development 2026"
    And I fill Description with "Second instance attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And only one program named "Web Development 2026" exists in the list

  Scenario: Case-variant duplicate program name is rejected on create
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "web development 2026" as Program Name
    And I click Create
    Then I see an error indicating the name already exists
    And no second program is created for that name

  Scenario: Program Name longer than 100 characters is rejected on create
    Given I am logged in as an admin user
    And I am on the program creation form
    When I enter a 101-character string as Program Name
    Then the Create button is disabled or a validation error is shown
    And no program is created with that over-length name

  Scenario: Empty Program Name cannot be submitted
    Given I am logged in as an admin user
    And I am on the program creation form
    When I leave Program Name empty
    And I fill Description with "Missing name test"
    Then the Create button is disabled
    And no program is created

  Scenario: Padded duplicate name is rejected after trim
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "  Web Development 2026  " as Program Name
    And I click Create
    Then duplicate-name validation treats the trimmed name as "Web Development 2026"
    And I see an error indicating the name already exists

  # Edge cases

  Scenario: Program Name with exactly 100 characters is accepted
    Given I am logged in as an admin user
    And I am on the program creation form
    When I enter a string of exactly 100 characters as Program Name
    And I fill Description with "Boundary at maximum"
    And I click Create
    Then the program is created with the full 100-character name visible in the list

  Scenario: Double-clicking Create does not create duplicate programs
    Given I am logged in as an admin user
    And I am on the program creation form
    When I enter a unique Program Name
    And I fill Description with "Double submit guard"
    And I double-click Create quickly
    Then exactly one new program with that name appears in the list

  Scenario: Duplicate error is accessible and visible in the New Program modal
    Given I am logged in as an admin user
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "Web Development 2026" as Program Name
    And I click Create
    Then an error message about duplicate name is visible to the user
    And assistive technology can perceive the error (e.g. alert or described field)

# ---
# Ambiguities / gaps (resolve before automation):
# - DS-3 ACs do not mention the 100-character maximum; Confluence field rules and defect DS-199 define it — confirm as in-scope for this story.
# - Whitespace AC says trim-then-empty but does not specify disabled Create vs error on click.
# - Exact duplicate error copy and whether the modal stays open are not defined in ACs.
# - Edit-flow duplicate validation is covered by DS-2, not DS-3 ACs.
# - Whether uniqueness is case-sensitive is not stated in the ticket (defects assume case-insensitive).
# - XSS or malicious input in Program Name is not in ACs.
