# Generated from Jira DS-3: Program name validation and duplicate prevention
# UI verified on 2026-10-27 against test.didaxis.studio (browser MCP).
# Review before automating.
#
# Locator hints:
# - Page heading: Programs
# - Button: "+ New Program" (accessible name includes "New Program")
# - Dialog: "New Program"
# - Textbox: "Program Name" (required, placeholder "e.g. Computer Science BSc")
# - Textbox: "Description" (optional, placeholder "Brief description")
# - Button: "Create" (disabled while Program Name is empty or whitespace-only)
# - Button: "Cancel"
# - List row actions: "Edit <program name>", "Delete <program name>"

Feature: DS-3 Program name validation and duplicate prevention

  # Happy paths

  Scenario: Program name with special characters is created and listed
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I enter "Informatique & IA - Niveau 2" in "Program Name"
    And I enter "Full-stack curriculum with ampersand" in "Description"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Informatique & IA - Niveau 2"

  # Negative

  Scenario: Whitespace-only Program Name cannot be submitted
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I enter "   " in "Program Name"
    Then the "Create" button is disabled
    And the "New Program" dialog stays open
    And the Programs list does not show a program named "   "

  Scenario: Duplicate Program Name is rejected with an error
    Given I am signed in as an admin on the Programs page
    And a program named "Web Development 2026" already exists
    When I click "+ New Program"
    And I enter "Web Development 2026" in "Program Name"
    And I enter "Second attempt" in "Description"
    And I click "Create"
    Then the "New Program" dialog stays open
    And I see an error indicating the name already exists
    And the Programs list still shows only one "Web Development 2026"

  # Edge cases

  Scenario: Empty Program Name keeps Create disabled
    Given I am signed in as an admin on the Programs page
    And the "New Program" dialog is open
    When I leave "Program Name" empty
    Then the "Create" button is disabled
    And the "New Program" dialog stays open

  Scenario: Leading and trailing spaces are removed from the saved Program Name
    Given I am signed in as an admin on the Programs page
    When I click "+ New Program"
    And I enter "  Informatique & IA - Niveau 2  " in "Program Name"
    And I click "Create"
    Then the "New Program" dialog closes
    And the Programs list shows "Informatique & IA - Niveau 2"
    And the Programs list does not show a program whose name still has those leading or trailing spaces

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket says "fill other required fields" on create. On the live form, Program Name is the only required field. Description, Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, and Focus Areas are optional. Default Session Hours is prefilled with 4 and Default Exam Hours with 3.
# - Ticket whitespace AC says click Create and the form is not submitted because the name is trimmed and treated as empty. Live UI disables Create for "   " and for an empty name, so Create cannot be clicked. Scenarios assert the disabled button and the dialog staying open.
# - Exact duplicate error copy is not specified. Live app (2026-10-27) accepts an exact duplicate: the dialog closes, no alert or error is shown, and a second row appears. Known related bugs include DS-249 and DS-201. Do not treat that as the expected result.
# - Uniqueness rules not stated: case sensitivity ("web development 2026" vs "Web Development 2026"), internal double spaces, and whether a trimmed name that matches an existing name counts as a duplicate.
# - DS-3 does not state a maximum Program Name length. The field has no maxlength. The list already contains names longer than 100 characters. A 100-character limit appears in other notes, not in this ticket's acceptance criteria.
# - Shared test data already contains many "Web Development 2026" and "Informatique & IA - Niveau 2…" rows. Automation should use a unique suffix and clean up created programs, while still asserting the ticket's values (special characters, whitespace, duplicate of a name that exists).
# - Delete removes a row immediately; no confirmation dialog was shown. Cleanup can use the "Delete <program name>" button.
