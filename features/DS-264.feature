# Generated from Jira DS-264: Julia CLONE - Create new academic program
# Review before automating.
# Live UI recon skipped on 2026-11-04: DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset, so the app was not opened this run.
# Locator hints below come from pages/NewProgramModal.ts, pages/ProgramsPage.ts, and the 2026-10-27 DS-3 pass. They were not re-checked in a browser on this run:
# - Heading: "Programs"
# - Button: name matches /new program/i (ticket copy is "+ New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required)
# - Textbox: "Description"
# - Button: "Create" (disabled while Program Name is empty or whitespace-only, per the 2026-10-27 DS-3 pass)
# - Button: "Cancel"

Feature: DS-264 Julia CLONE - Create new academic program

  # Happy paths

  Scenario: Programs page opens the New Program form
    Given I am signed in as an admin
    When I open the Programs page
    And I click "+ New Program"
    Then the "New Program" dialog is open
    And I see the "Program Name" textbox
    And I see the "Description" textbox
    And I see the "Create" button

  Scenario: A program is created and appears in the list
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I enter "Full-stack web development program" in "Description"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

  # Negative

  Scenario: An empty Program Name keeps Create disabled
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And the "New Program" dialog stays open

  Scenario: Cancel closes the form without adding the program
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I enter "Full-stack web development program" in "Description"
    And I click "Cancel"
    Then the "New Program" dialog closes
    And the Programs list does not show that unsaved "Web Development 2026"

  # Edge cases

  Scenario: A whitespace-only Program Name keeps Create disabled
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "   " in "Program Name"
    Then the "Create" button is disabled
    And the "New Program" dialog stays open
    And the Programs list does not show a program named "   "

  Scenario: A program can be created with an empty Description
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "Web Development 2026" in "Program Name"
    And I leave "Description" empty
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Web Development 2026"

# ---
# Ambiguities / gaps (resolve before automation):
# - Live UI recon was skipped this run because DIDAXIS_EMAIL and DIDAXIS_PASSWORD are unset.
# - Ticket says click "+ New Program". The suite matches the button by accessible name /new program/i inside main. The visible label was not re-read this run.
# - Ticket lists Program Name and Description only. The 2026-10-27 DS-3 note says Program Name is the only required field, and Description, Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, and Focus Areas are optional. This feature does not assert those extra fields.
# - Whitespace-only names are not an acceptance criterion on DS-264. The disabled-Create step is carried from the DS-3 pass on 2026-10-27, where Create could not be clicked for "   ". This run did not re-confirm that.
# - Empty Description is not in the DS-264 acceptance criteria. The existing create suite treats Description as optional. This run did not re-confirm a successful save with a blank description.
# - The sample name "Web Development 2026" already exists many times in the shared environment. Automation should use a unique suffix and still assert the ticket wording.
# - Duplicate names, special characters, and a maximum length belong to other tickets (DS-266 covers validation). They are not scenarios here.
# - Network failures (create 503, malformed JSON, 401/403) were not reproduced. No error copy was observed. Do not invent banner text.
