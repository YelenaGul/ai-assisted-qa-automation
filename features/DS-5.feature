# Generated from Jira DS-5: Program list filtering and display
# Review before automating.

Feature: DS-5 Program list filtering and display

  # Happy paths

  Scenario: Programs page lists each program with name and description
    Given I am logged in as an admin user
    And programs exist in the system including "Web Development 2026" with description "Full-stack web development program"
    And programs exist including "Data Science 2026" with description "Intro to data science"
    When I navigate to the Programs page
    Then I see a program list or table
    And the list shows "Web Development 2026" with description "Full-stack web development program"
    And the list shows "Data Science 2026" with description "Intro to data science"

  Scenario: Single program entry shows its full details in the list
    Given I am logged in as an admin user
    And only one program "Solo Program 2026" exists with description "Only program in catalog"
    When I navigate to the Programs page
    Then I see "Solo Program 2026" in the list
    And I see description "Only program in catalog" for that program

  Scenario: Empty state when no programs exist
    Given I am logged in as an admin user
    And no programs exist in the system
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Programs page exposes navigation to create a new program
    Given I am logged in as an admin user
    When I navigate to the Programs page
    Then I see a "+ New Program" or equivalent action to add a program

  # Negative

  Scenario: Programs list does not show programs that were deleted
    Given I am logged in as an admin user
    And a program "Deleted Ghost Program" existed and was deleted
    When I navigate to the Programs page
    Then "Deleted Ghost Program" does not appear in the list

  Scenario: API failure does not masquerade as an empty catalog when programs exist
    Given I am logged in as an admin user
    And programs exist in the system
    When the Programs list API returns an error such as HTTP 500
    Then I do not see the empty-state message as if no programs existed
    And I see a user-visible error explaining that the list could not be loaded

  Scenario: Malformed programs API response shows an error instead of a blank page
    Given I am logged in as an admin user
    When the Programs list API returns malformed JSON or an unexpected shape
    Then the Programs page shows a user-visible error state
    And the page does not render as a blank white screen with no explanation

  # Edge cases

  Scenario: Long description displays in the list without breaking layout
    Given I am logged in as an admin user
    And a program exists with a description of 500 characters
    When I navigate to the Programs page
    Then the program row is visible
    And the description is shown or truncated in a readable way without breaking the table layout

  Scenario: Special characters in name and description render as plain text
    Given I am logged in as an admin user
    And a program exists with name "QA & Testing — \"Phase 1\""
    And description "Symbols: <tag> & 'quote'"
    When I navigate to the Programs page
    Then the list shows those values as plain text, not executed HTML

  Scenario: List remains consistent after page refresh
    Given I am logged in as an admin user
    And a program "Web Development 2026" exists
    When I navigate to the Programs page
    And I reload the page
    Then "Web Development 2026" is still listed with the same description

  Scenario: Very long program name does not make the row unusable
    Given I am logged in as an admin user
    And a program exists with a name at or near the maximum allowed length
    When I navigate to the Programs page
    Then the program row remains visible within the viewport or scrollable without hiding row actions

# ---
# Ambiguities / gaps (resolve before automation):
# - Title says "filtering" but ACs only cover display and empty state — search/filter/pagination are not specified (linked bugs note missing filters).
# - Empty-state scenario requires a tenant with zero programs; shared test environments may always have data.
# - Whether description is fully shown vs truncated in the table is not defined in ACs.
# - Column structure (table vs cards) and accessible names for action columns are not in ACs.
# - Viewer vs admin visibility of Edit/Delete on the list is out of AC scope but noted in linked defects.
# - Performance expectations for large lists (hundreds of rows) are not in the ticket.
