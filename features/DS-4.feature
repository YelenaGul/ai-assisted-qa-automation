# Generated from Jira DS-4: Delete program with confirmation
# UI verified on 2026-11-07 against test.didaxis.studio (Playwright CLI recon).
# Review before automating.
#
# Locator hints:
# - Page heading: Programs
# - Row action button: "Delete <program name>"
# - Confirmation is a native window.confirm (not a Mantine dialog)
# - Confirm copy: Delete program "<name>"? All its semesters and courses will be removed. This cannot be undone.

Feature: DS-4 Delete program with confirmation

  # Happy paths

  Scenario: Confirmed delete removes program from list
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog that names "Test Program"
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel program deletion keeps the program
    Given a program "Cancel Delete Sample" exists
    When I click the delete icon for "Cancel Delete Sample"
    And I see the confirmation dialog
    And I click Cancel / dismiss
    Then the program still exists in the list

  # Edge cases

  Scenario: Deleting one program leaves others intact
    Given programs "Keep Me" and "Remove Me" exist
    When I confirm deletion of "Remove Me"
    Then "Remove Me" is not in the list
    And "Keep Me" remains in the list

  Scenario: Confirmation dialog identifies program with special characters
    Given a program "Informatique & IA - Niveau 2" exists
    When I open the delete confirmation for that program
    Then the confirmation message contains "Informatique & IA - Niveau 2"
    And dismissing keeps the program in the list

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket says "confirmation dialog"; live app uses native window.confirm (accept/dismiss).
# - Delete API error feedback is out of scope for DS-4 ACs (covered by other tickets).
