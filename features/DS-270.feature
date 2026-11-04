# Generated from Jira DS-270: [Raya + Create new academic program]
# Cloned from DS-1.
# Review before automating.
# Live UI recon skipped on 2026-11-04: DIDAXIS_EMAIL and DIDAXIS_PASSWORD are not set.
#
# Locator hints from existing page objects (not re-checked on the live app this run):
# - Page heading: Programs
# - Button accessible name includes "New Program" (ticket copy: "+ New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required)
# - Textbox: "Description"
# - Button: "Create"
# - Button: "Cancel"

Feature: DS-270 Create a new academic program

  # Happy paths

  Scenario: Admin opens the program creation form from the Programs page
    Given I am signed in as an admin
    When I open the Programs page
    And I click "+ New Program"
    Then I see the "New Program" dialog
    And I see a "Program Name" field
    And I see a "Description" field
    And I see a "Create" button

  Scenario: Admin creates Web Development 2026 and sees it in the list
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I enter "Full-stack web development program" in "Description"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

  # Negative

  Scenario: Empty Program Name keeps Create disabled
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And the "New Program" dialog stays open
    And the Programs list does not gain a new program from this attempt

  Scenario: Cancel closes the form without adding a program
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I enter "Full-stack web development program" in "Description"
    And I click "Cancel"
    Then the "New Program" dialog closes
    And the Programs list does not show that unsaved "Web Development 2026" entry

  # Edge cases

  Scenario: A program can be created when Description is left empty
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I leave "Description" empty
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

  Scenario: Whitespace-only Program Name keeps Create disabled
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I enter "   " in "Program Name"
    Then the "Create" button is disabled
    And the "New Program" dialog stays open

  Scenario: A failed save does not add the program or close the form
    Given I am signed in as an admin
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I enter "Full-stack web development program" in "Description"
    And the create request fails with HTTP 503
    Then the "New Program" dialog stays open
    And the Programs list does not show a newly saved "Web Development 2026"
    And no specific error sentence is asserted until the live message is recorded

# ---
# Ambiguities / gaps (resolve before automation):
# - Live UI recon was skipped this run because DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset. Labels above come from pages/ProgramsPage.ts, pages/NewProgramModal.ts, and the 2026-10-27 notes in features/DS-3.feature.
# - Ticket says click "+ New Program". The page object matches a button whose accessible name includes "New Program".
# - Ticket lists Program Name and Description only. Prior notes say Program Name is the only required field; Description is optional. Other fields (Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, Focus Areas) are not in this ticket's acceptance criteria.
# - Prior notes say Create is disabled for an empty or whitespace-only Program Name, so Create cannot be clicked in those cases. Scenarios assert the disabled button.
# - Shared test data already contains "Web Development 2026". Automation should keep that visible phrase and add a unique suffix, then delete the created program.
# - Cancel control is in the page-object notes as "Cancel". This run did not confirm it on the live dialog. If Cancel is absent, do not invent a click; record the gap.
# - HTTP 503 copy was not observed this run. Do not invent an error string. Assert only that the dialog stays open and the program is not listed. Do not mock the create endpoint in the happy-path scenario.
# - Duplicate names are a DS-271 concern. DS-270's success scenario assumes the name used for the run is unique.
