# Generated from Jira DS-199: [Yuliia Kulyk] Program Name over 100 chars accepted on create (TC-016)
# Parent: DS-3 Program name validation and duplicate prevention
# Review before automating.

Feature: DS-199 Program Name maximum length (100) enforced on create

  # Happy paths

  Scenario: Program Name with exactly 100 characters is accepted on create
    Given I am logged in as an admin user at https://test.didaxis.studio/login
    And I am on the Programs page at /programs
    And I open the New Program creation form
    When I fill Program Name with a string of exactly 100 characters
    And I fill Description with "Full-stack web development program"
    And I click Create
    Then the New Program modal closes
    And the Programs list shows the new program with the full 100-character name

  Scenario: Program Name with 99 characters is accepted on create
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I fill Program Name with a string of exactly 99 characters
    And I fill Description with "Boundary below maximum"
    And I click Create
    Then the New Program modal closes
    And the Programs list includes the program with that name

  Scenario: User can correct an over-length name and create successfully
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I fill Program Name with a string of 101 characters
    And I see that Create is disabled or a validation error for Program Name length
    And I shorten Program Name to exactly 100 characters
    And I click Create
    Then the New Program modal closes
    And the program is created with the 100-character name

  # Negative

  Scenario: Program Name with 101 characters blocks create on New Program form
    Given I am logged in as an admin user at https://test.didaxis.studio/login
    And I navigate to Programs at /programs
    And I click "+ New Program"
    When I enter a 101-character string in Program Name
    Then the Create button is disabled or a visible validation error is shown for Program Name
    And no program with that 101-character name appears in the Programs list

  Scenario: Submitting over-length Program Name does not persist a program
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When Program Name contains more than 100 characters
    And I attempt to click Create if it is enabled
    Then the server responds with HTTP 400 for the create request or the client blocks submission
    And no new program row is added for the over-length name

  Scenario: Pasting text longer than 100 characters into Program Name triggers length validation
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I paste a string of 150 characters into Program Name
    Then the Create button is disabled or a validation error indicates the 100-character maximum
    And the field does not silently truncate without user-visible feedback unless product spec defines truncation

  # Edge cases

  Scenario: Maximum-length name with special characters at the 100-character boundary is valid
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I fill Program Name with exactly 100 characters including "&", "-", and spaces
    And I fill Description with "Special chars at max length"
    And I click Create
    Then the program is created and the full name is visible in the Programs list

  Scenario: Length validation applies to the trimmed Program Name if trimming is defined
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I fill Program Name with leading spaces plus a 100-character core name such that total input exceeds 100 characters before trim
    Then validation follows Program Setup rules for trim plus max length
    And Create remains disabled or an error is shown until the stored name would be at most 100 characters

  Scenario: Character counter or inline hint reflects 100-character limit when present
    Given I am logged in as an admin user
    And I am on the New Program creation form
    When I focus Program Name
    Then if the UI shows a limit hint or counter, it indicates a maximum of 100 characters
    And when I exceed 100 characters the hint or counter reflects the invalid state

# ---
# Ambiguities / gaps (resolve before automation):
# - DS-199 is a defect sub-task; formal Gherkin ACs live on parent DS-3 and do not mention the 100-character rule — length rules come from Confluence "Program Setup — Field Definitions" and "Validation Rules" cited in DS-199.
# - Expected UX allows either disabled Create or visible validation error; tests should accept both if product confirms both are valid.
# - Unclear whether validation runs on keystroke, on blur, or only on submit when Create is still shown enabled.
# - Unclear whether the field hard-caps input at 100 characters or allows typing/pasting beyond with error state.
# - Edit Program / Save on existing programs is out of DS-199 reproduction steps but may share the same max-length rule — confirm scope.
# - Related defect DS-191 tracks the same issue on DS-1 create flow; avoid duplicate automation unless intentional regression coverage.
# - Exact wording and placement of the user-visible error message are not specified in DS-199.
