# Generated from Jira DS-1: Create new academic program
# UI verified on 2026-11-07 against test.didaxis.studio (Playwright CLI recon).
# Review before automating.
#
# Locator hints:
# - Page heading: Programs
# - Button: "+ New Program" (role button, name /new program/i)
# - Dialog: "New Program"
# - Textbox: "Program Name" (placeholder "e.g. Computer Science BSc")
# - Textbox: "Description" (placeholder "Brief description")
# - Button: "Create" (disabled while Program Name is empty or whitespace-only)
# - Button: "Cancel"

Feature: DS-1 Create new academic program

  # Happy paths

  Scenario: Program creation form shows Program Name and Description
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    Then I see the "New Program" dialog
    And I see the "Program Name" field
    And I see the "Description" field
    And I see the "Create" button

  Scenario: Successfully create a program
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the "New Program" dialog closes
    And the program list shows "Web Development 2026"

  Scenario: Program can be created with empty Description
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I fill in Program Name with "Program No Description"
    And I leave Description empty
    And I click Create
    Then the "New Program" dialog closes
    And the program list shows "Program No Description"

  # Negative

  Scenario: Validation prevents empty program name
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I leave the Program Name field empty
    And I fill in Description with "Optional description"
    Then the Create button is disabled

  Scenario: Whitespace-only Program Name cannot be submitted
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "   " in Program Name
    Then the Create button is disabled
    And the "New Program" dialog stays open

  # Edge cases

  Scenario: Program name with special characters is accepted and listed
    Given I am signed in as an admin on the Programs page
    When I create a program named "Pay & Learn (50%) — QA" with description "Special characters in title"
    Then the program list shows "Pay & Learn (50%) — QA"

  Scenario: Program name at max length 100 is accepted and listed
    Given I am signed in as an admin on the Programs page
    When I create a program whose name is exactly 100 characters
    Then the program list shows that 100-character name

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket ACs do not cover duplicate-name rejection (owned by DS-3) or over-max length.
# - Live UI: Create stays disabled for empty and whitespace-only Program Name (confirmed).
# - Non-admin create restriction is not testable with a single admin account in .env.
